using System;
using System.Runtime.Serialization;

namespace NetCoreAuth.Core
{
    public abstract class FormatableException : ExceptionBase
    {
        protected FormatableException()
            : base()
        {
        }

        protected FormatableException(string message)
            : base(message)
        {
        }

        protected FormatableException(string format, params object[] args)
            : base(string.Format(format, args))
        {
        }

        protected FormatableException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected FormatableException(string format, Exception innerException, params object[] args)
            : base(string.Format(format, args), innerException)
        {
        }

        protected FormatableException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
