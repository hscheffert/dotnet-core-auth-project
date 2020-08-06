using System;
using System.Runtime.Serialization;

namespace NetCoreAuth.Core
{
    public class TypeNotFoundException : FormatableException
    {
        private static readonly string DefaultMessage = "Type'{0}' was not found in Assembly '{1}'.";

        public TypeNotFoundException()
            : base()
        {
        }

        public TypeNotFoundException(string typeName, string assemblyName)
            : base(DefaultMessage, typeName, assemblyName)
        {
        }

        public TypeNotFoundException(Exception innerException, string typeName, string assemblyName)
            : base(DefaultMessage, innerException, assemblyName)
        {
        }

        public TypeNotFoundException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }

        public override bool IsUserFriendly => false;
    }
}
