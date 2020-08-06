using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace NetCoreAuth.Core
{
    public static class StringExtensions
    {
        public static bool IsNumeric(this string s)
        {
            double value = 0;
            return double.TryParse(s, System.Globalization.NumberStyles.Any, System.Globalization.NumberFormatInfo.InvariantInfo, out value);
        }

        public static string Truncate(this string value, int length)
        {
            return value.Truncate(0, length);
        }

        public static string Truncate(this string value, int startPosition, int length)
        {
            string returnValue = value;

            if (returnValue != null)
            {
                if (value.Length >= startPosition + length)
                {
                    returnValue = value.Substring(startPosition, length);
                }
                else
                {
                    returnValue = value.Substring(startPosition, value.Length - startPosition);
                }
            }

            return returnValue;
        }

        public static string AppendToMultiLineString(this string value, string toAdd)
        {
            string val = string.Empty;
            if (!string.IsNullOrEmpty(value))
            {
                val = value;
                if (!string.IsNullOrEmpty(toAdd))
                {
                    val += System.Environment.NewLine + toAdd;
                }
            }
            else if (!string.IsNullOrEmpty(toAdd))
            {
                val = toAdd;
            }

            return val;
        }

        /// <summary>
        /// shortens string and adds "..." to the end
        /// </summary>
        /// <param name="value">the string to perform the operation on</param>
        /// <param name="length">the length of the returned string</param>
        /// <returns></returns>
        public static string Shorten(this string value, int length)
        {
            return value.Shorten(0, length);
        }

        /// <summary>
        /// shortens string and adds "..." to the end
        /// </summary>
        /// <param name="value">the string to perform the operation on</param>
        /// <param name="startPosition">starting index of the operation</param>
        /// <param name="length">the length of the returned string</param>
        /// <returns></returns>
        public static string Shorten(this string value, int startPosition, int length)
        {
            var truncated = value.Truncate(startPosition, length);

            if (truncated != null && truncated.Length < value.Length)
            {
                return truncated + "...";
            }

            return value;
        }

        /// <summary>
        /// Splits pascal case and camel case strings into parts.
        /// ex. (camelCase => ["camel", "Case"])
        /// ex. (PascalCase => ["Pascal", "Case"])
        /// Also Note the string splits on special characters as well !@#$%^&* etc.
        /// </summary>
        /// <param name="str">Cased string to split.</param>
        /// <returns>Split string.</returns>
        public static string[] SplitOnUppercase(this string str)
        {
            if (str == null || str == string.Empty) { return Array.Empty<string>(); }

            Regex reg = new Regex("([A-Z]+(?=$|[A-Z][a-z])|[A-Z]?[a-z]+|[0-9]+)", RegexOptions.ExplicitCapture);
            var matches = reg.Matches(str.Replace("_", string.Empty));
            string[] split = new string[matches.Count];

            for (int i = 0; i < matches.Count; i++)
            {
                split[i] = matches[i].ToString();
            }

            return split;
        }

        public static string ToTitle(this string str)
        {
            return string.Join(" ", str.SplitOnUppercase());
        }

        public static bool Contains(this string source, string toCheck, StringComparison comp)
        {
            return source.IndexOf(toCheck, comp) >= 0;
        }

        /// <summary>
        /// Indicates whether this instance contains one or more characters (i.e., this instance is not null and not String.Empty).
        /// </summary>
        /// <param name="str">String object to evaluate.</param>
        /// <returns>True if the string contains one or more characters; otherwise false.</returns>
        public static bool HasValue(this string str)
        {
            return !string.IsNullOrEmpty(str);
        }

        /// <summary>
        /// Indicates whether this instance is null.
        /// </summary>
        /// <param name="str">String object to evaluate.</param>
        /// <returns>True if the string is null; otherwise false.</returns>
        public static bool IsNull(this string str)
        {
            return (str == null);
        }

        /// <summary>
        /// Indicates whether this instance is null or String.Empty.
        /// </summary>
        /// <param name="str">String object to evaluate.</param>
        /// <returns>True if the string is null or empty; otherwise false.</returns>
        public static bool IsNullOrEmpty(this string str)
        {
            return string.IsNullOrEmpty(str);
        }

        /// <summary>
        /// Determines whether this string is null, has zero length, or contains only whitespace characters.
        /// </summary>
        /// <param name="str">String to evaluate.</param>
        /// <returns>True if the string is null, empty, or contains only white space; otherwise, false.</returns>
        public static bool IsNullOrEmptyOrWhitespace(this string str)
        {
            return string.IsNullOrWhiteSpace(str);
        }


        /// <summary>
        /// Determines whether this instance has the same value as any other <see cref="T:System.String" /> instance in the specified array.
        /// </summary>
        /// <param name="str">The <see cref="T:System.String" /> value to be tested.</param>
        /// <param name="values">An array of <see cref="T:System.String" /> values to be checked.</param>
        /// <returns>True if the <paramref name="values" /> array contains a value that is the same as this instance; otherwise, false.</returns>
        /// <exception cref="T:System.NullReferenceException">This instance is null.</exception>
        public static bool EqualsAny(this string str, params string[] values)
        {
            if (values == null) throw new ArgumentNullException("values");

            if (str != null && values.Length > 0)
            {
                for (int i = 0; i < values.Length; i++)
                {
                    if (str.Equals(values[i]))
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        /// <summary>
        /// Determines whether this instance has the same value as any other <see cref="T:System.String" /> instance in the specified array.
        /// A parameter specifies the culture, case, and sort rules used in the comparison.
        /// </summary>
        /// <param name="str">The <see cref="T:System.String" /> value to be tested.</param>
        /// <param name="values">An array of <see cref="T:System.String" /> values to be checked.</param>
        /// <param name="comparisonType">One of the <see cref="T:System.StringComparison" /> values.</param>
        /// <returns>True if the <paramref name="values" /> array contains a value that is the same as this instance; otherwise, false.</returns>
        /// <exception cref="T:System.NullReferenceException">This instance is null.</exception>
        /// <exception cref="T:System.ArgumentException"><paramref name="comparisonType" /> is not a <see cref="T:System.StringComparison" /> value.</exception>
        public static bool EqualsAny(this string str, string[] values, StringComparison comparisonType)
        {
            if (values == null) throw new ArgumentNullException("values");

            if (str != null && values.Length > 0)
            {
                for (int i = 0; i < values.Length; i++)
                {
                    if (str.Equals(values[i], comparisonType))
                    {
                        return true;
                    }
                }
            }
            return false;
        }


        /// <summary>
        /// Removes every occurrence in this instance of any character in a specified array of characters.
        /// </summary>
        /// <param name="str">String to be modified.</param>
        /// <param name="charsToRemove">Characters to be removed from the string.</param>
        /// <returns>Original string value, less the characters specified.</returns>
        public static string RemoveAny(this string str, params char[] charsToRemove)
        {
            // don't process the string if there is nothing to do
            if (string.IsNullOrEmpty(str) || charsToRemove == null || charsToRemove.Length == 0)
            {
                return str;
            }

            // create a buffer that will hold the new string
            char[] newStr = new char[str.Length];

            // copy all the characters not in the remove list to the new character array
            int start = 0;
            int numberSkipped = 0;
            while (start < str.Length)
            {
                // find the next character to remove
                int end = str.IndexOfAny(charsToRemove, start);
                if (end < 0)
                {
                    // no more matches
                    end = str.Length;
                }

                // copy each character between the last one removed and the new one to remove
                for (int i = start; i < end; i++)
                {
                    newStr[i - numberSkipped] = str[i];
                }

                // increment our skip count if something was removed
                if (end < str.Length)
                {
                    numberSkipped += 1;
                }

                // start the next cycle with the character after the one removed
                start = end + 1;
            }

            // return the new string
            if (numberSkipped > 0)
            {
                return new string(newStr, 0, str.Length - numberSkipped);
            }
            else // nothing removed/skipped
            {
                return str;
            }
        }


        /// <summary>
        /// Converts this string to an array of bytes using UTF8 encoding.
        /// </summary>
        /// <param name="str">String to be converted.</param>
        /// <returns>Byte array containing the converted string.</returns>
        public static byte[] ToByteArray(this string str)
        {
            return str.ToByteArray(Encoding.UTF8);
        }

        /// <summary>
        /// Converts this string to an array of bytes using a specified encoding.
        /// </summary>
        /// <param name="str">String to be converted.</param>
        /// <param name="encoding">Encoding to use when converting.</param>
        /// <returns>Byte array containing the converted string.</returns>
        public static byte[] ToByteArray(this string str, Encoding encoding)
        {
            return encoding.GetBytes(str);
        }


        /// <summary>
        /// Removes all leading and trailing white-space characters from this string, while safely handling null.
        /// If null is passed, null is returned.
        /// </summary>
        /// <param name="str">String value to be processed.</param>
        /// <returns>The string that remains after all white-space characters are removed from the start and end of this string.</returns>
        /// <exception cref="T:System.ArgumentOutOfRangeException"><c>startIndex</c> or <c>length</c> is less than zero.</exception>
        public static string TrimSafely(this string str)
        {
            return (str != null ? str.Trim() : str);
        }


        /// <summary>
        /// Returns as much of the specified substring as possible without reading outside the bounds of the of the string.
        /// If <c>startIndex</c> is past the end of the string, <c>String.Empty</c> is returned.
        /// If <c>startIndex</c> plus <c>length</c> is not within the string, the substring from the <c>startIndex</c> to the end of the string is returned.
        /// </summary>
        /// <param name="str">String value to be processed.</param>
        /// <param name="startIndex">Index of the start of the substring.</param>
        /// <param name="length">Maximum number of characters in the substring.</param>
        /// <returns>As much of the specified substring as possible without reading past the end of the string.</returns>
        /// <exception cref="T:System.ArgumentOutOfRangeException"><c>startIndex</c> or <c>length</c> is less than zero.</exception>
        public static string SubstringAtMost(this string str, int startIndex, int length)
        {
            if (startIndex < 0)
            {
                throw new ArgumentOutOfRangeException("startIndex", "Value cannot be negative.");
            }
            if (length < 0)
            {
                throw new ArgumentOutOfRangeException("length", "Value cannot be negative.");
            }

            // null always substrings to null
            if (str == null)
            {
                return null;
            }

            // return empty string if start index is off the end of the string
            if (startIndex >= str.Length)
            {
                return string.Empty;
            }

            // adjust the return length if we would read off the end of string
            if ((startIndex + length) > str.Length)
            {
                length = str.Length - startIndex;
            }

            // see if we can avoid unnecessary string processing
            if (startIndex == 0 && length == str.Length)
            {
                return str;
            }

            // we can now safely substring without getting an exception
            return str.Substring(startIndex, length);
        }

        /// <summary>
        /// Returns a right-most substring from this instance having the specified length.
        /// </summary>
        /// <param name="str">String value to be processed.</param>
        /// <param name="length">Number of characters in the substring.</param>
        /// <returns>The right-most substring containing <c>length</c> characters.</returns>
        /// <exception cref="T:System.ArgumentOutOfRangeException"><c>length</c> is less than zero or greater than the length of this instance.</exception>
        public static string Right(this string str, int length)
        {
            if (str == null)
            {
                throw new ArgumentNullException("str");
            }
            if (length < 0 || length > str.Length)
            {
                throw new ArgumentOutOfRangeException("length");
            }
            return str.Substring(str.Length - length, length);
        }

        /// <summary>
        /// Returns as much of the right-most substring as possible, up to <c>length</c> characters.
        /// If <c>length</c> is greater than the length of this instance, this instance is returned.
        /// </summary>
        /// <param name="str">String value to be processed.</param>
        /// <param name="length">Maximum number of characters in the substring.</param>
        /// <returns>As much of the right-most substring as possible, up to <c>length</c> characters.</returns>
        public static string RightAtMost(this string str, int length)
        {
            // null always substrings to null
            if (str == null)
            {
                return null;
            }

            // see if caller is requesting more string than they passed
            if (length > str.Length)
            {
                return str;
            }

            // return the rght-most substring
            return str.Substring(str.Length - length, length);
        }

        /// <summary>
        /// Returns a left-most substring from this instance having the specified length.
        /// </summary>
        /// <param name="str">String value to be processed.</param>
        /// <param name="length">Number of characters in the substring.</param>
        /// <returns>The left-most substring containing <c>length</c> characters.</returns>
        /// <exception cref="T:System.ArgumentOutOfRangeException"><c>length</c> is less than zero or greater than the length of this instance.</exception>
        public static string Left(this string str, int length)
        {
            if (str == null)
            {
                throw new ArgumentNullException("str");
            }

            // see if caller is requesting more string than they passed
            if (length > str.Length)
            {
                throw new ArgumentOutOfRangeException("length");
            }

            // return the left-most substring
            return str.Substring(0, length);
        }

        /// <summary>
        /// Returns as much of the left-most substring as possible, up to <c>length</c> characters.
        /// If <c>length</c> is greater than the length of this instance, this instance is returned.
        /// </summary>
        /// <param name="str">String value to be processed.</param>
        /// <param name="length">Maximum number of characters in the substring.</param>
        /// <returns>As much of the left-most substring as possible, up to <c>length</c> characters.</returns>
        public static string LeftAtMost(this string str, int length)
        {
            // null always substrings to null
            if (str == null)
            {
                return null;
            }

            // see if caller is requesting more string than they passed
            if (length > str.Length)
            {
                return str;
            }

            // return the left-most substring
            return str.Substring(0, length);
        }

        /// <summary>
        /// Trim a set string from the start of another string if that string starts with the string to trim.
        /// </summary>
        /// <param name="str">String to trim from.</param>
        /// <param name="trimValue">value that will be trimmed</param>
        /// <param name="options">Optional StringComparison options</param>
        /// <returns></returns>
        public static string TrimStart(this string str, string trimValue, StringComparison options = StringComparison.CurrentCultureIgnoreCase)
        {
            // null always substrings to null

            if (!str.IsNullOrEmpty() &&
                !trimValue.IsNullOrEmpty() &&
                str.Length >= trimValue.Length &&
                str.StartsWith(trimValue, options))
            {
                return str.Substring(trimValue.Length);
            }
            return str;
        }
    }
}
