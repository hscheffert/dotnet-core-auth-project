using System;
using System.Runtime.Serialization;

namespace NetCoreAuth.Core
{
    public abstract class ExceptionBase : Exception
    {
        protected ExceptionBase()
            : base()
        {
        }

        protected ExceptionBase(string message)
            : base(message)
        {
        }

        protected ExceptionBase(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected ExceptionBase(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }

        public abstract bool IsUserFriendly { get; }

        public string FriendlyMessage { get; protected set; }
    }
}
