using System;
using System.Security.Cryptography;

namespace NetCoreAuth.Core.Security
{
    public static class Hash
    {
        ///<summary>
		/// This contains the HashAlgorithms to use.
		///</summary>
		private static readonly HashAlgorithm[] Hashers;

        static Hash()
        {
            Hashers = new HashAlgorithm[]
        {
            new MD5CryptoServiceProvider(),
            new SHA256Managed(),
            new SHA512Managed()
        };
        }

        /// <summary>
        /// Hashes a string and returns a 64 byte base64 encoded string.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <returns>64 byte base64 encoded string..</returns>
        public static string ComputeLongHash(string value)
        {
            return ComputeHashInternal(value, Hashers[2]);
        }

        /// <summary>
        /// Hashes a string and returns a 32 byte base64 encoded string.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <returns>32 byte base64 encoded string.</returns>
        public static string ComputeHash(string value)
        {
            return ComputeHashInternal(value, Hashers[1]);
        }

        /// <summary>
        /// Hashes a string and returns a 16 byte base64 encoded string.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <returns>16 byte base64 encoded string.</returns>
        public static string ComputeShortHash(string value)
        {
            return ComputeHashInternal(value, Hashers[0]);
        }

        /// <summary>
        /// Hashes a string and returns a 64 byte array.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <returns>64 byte array.</returns>
        public static byte[] ComputeLongHashBytes(string value)
        {
            return ComputeHashByteInternal(value, Hashers[2]);
        }

        /// <summary>
        /// Hashes a string and returns a 32 byte array.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <returns>32 byte array.</returns>
        public static byte[] ComputeHashBytes(string value)
        {
            return ComputeHashByteInternal(value, Hashers[1]);
        }

        /// <summary>
        /// Hashes a string and returns a 16 byte array.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <returns>16 byte array.</returns>
        public static byte[] ComputeShortHashBytes(string value)
        {
            return ComputeHashByteInternal(value, Hashers[0]);
        }

        /// <summary>
        /// Hashes a string and returns a salted 16 byte base64 encoded string with the salt.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <param name="salt">Salt to use to make the hash more unique (if no salt is passed in, a new salt is generated).</param>
        /// <returns>16 byte base64 encoded string.</returns>
        public static SaltedHash ComputeShortSaltedHash(string value, string salt = "")
        {
            return ComputeSaltedHashInternal(value, salt, new HMACSHA1());
        }

        /// <summary>
        /// Hashes a string and returns a salted 32 byte base64 encoded string with the salt.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <param name="salt">Salt to use to make the hash more unique (if no salt is passed in, a new salt is generated).</param>
        /// <returns>32 byte base64 encoded string.</returns>
        public static SaltedHash ComputeSaltedHash(string value, string salt = "")
        {
            return ComputeSaltedHashInternal(value, salt, new HMACSHA256());
        }

        /// <summary>
        /// Hashes a string and returns a salted 64 byte base64 encoded string with the salt.
        /// </summary>
        /// <param name="value">String to hash.</param>
        /// <param name="salt">Salt to use to make the hash more unique (if no salt is passed in, a new salt is generated).</param>
        /// <returns>64 byte base64 encoded string.</returns>
        public static SaltedHash ComputeLongSaltedHash(string value, string salt = "")
        {
            return ComputeSaltedHashInternal(value, salt, new HMACSHA512());
        }

        /// <summary>
        /// Hashes a string and returns a base64 encoded string.
        /// </summary>
        /// <param name="value">String to encrypt.</param>
        /// <param name="hasher">HashAlgorithm to use.</param>
        /// <returns>Base64 encoded string.</returns>
        private static string ComputeHashInternal(string value, HashAlgorithm hasher)
        {
            if (value == null) throw new ArgumentNullException("value");

            if (value.Length > 0)
            {
                return ToString(ComputeHashByteInternal(value, hasher));
            }
            else
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Hashes a string and returns a base64 encoded string.
        /// </summary>
        /// <param name="value">String to encrypt.</param>
        /// <param name="hasher">HashAlgorithm to use.</param>
        /// <returns>Hex-encoded string.</returns>
        private static byte[] ComputeHashByteInternal(string value, HashAlgorithm hasher)
        {
            if (value == null) throw new ArgumentNullException("value");

            if (value.Length > 0)
            {
                return hasher.ComputeHash(ToBytes(value));
            }
            else
            {
                return new byte[0];
            }
        }

        /// <summary>
        /// Hashes a string with salt and returns base64 encoded string.
        /// </summary>
        /// <param name="value">String to encrypt.</param>
        /// <param name="salt">Salt to use to make the hash more unique (if salt is empty string, a new salt is generated).</param>
        /// <param name="hasher">KeyedHashAlgorithm to use.</param>
        /// <returns>Base64 encoded string.</returns>
        private static SaltedHash ComputeSaltedHashInternal(string value, string salt, KeyedHashAlgorithm hasher)
        {
            if (value == null) throw new ArgumentNullException("value");

            var hash = new SaltedHash();
            if (value.Length > 0)
            {

                if (salt.Length > 0)
                {
                    hash.Salt = salt;
                    hasher.Key = ToBytes(salt);
                }
                else
                {
                    hash.Salt = GenerateSalt();
                    hasher.Key = ToBytes(hash.Salt);
                }

                byte[] result = hasher.ComputeHash(ToBytes(value));
                hash.Hash = ToString(result);
            }

            return hash;
        }

        /// <summary>
        /// Generated a random salt
        /// </summary>
        private static string GenerateSalt()
        {
            byte[] data = new byte[17];
            var crypt = new RNGCryptoServiceProvider();
            crypt.GetBytes(data);
            return ToString(data);
        }

        private static byte[] ToBytes(string value)
        {
            return System.Text.Encoding.Unicode.GetBytes(value);
        }

        private static string ToString(byte[] value)
        {
            return Convert.ToBase64String(value);
        }
    }
}
