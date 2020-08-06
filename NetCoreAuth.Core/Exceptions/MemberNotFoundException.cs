using System;
using System.Runtime.Serialization;

namespace NetCoreAuth.Core
{
    public class MemberNotFoundException : Exception
    {
        public MemberNotFoundException()
            : base()
        {
        }

        public MemberNotFoundException(string memberName, System.Type typeSearched)
            : this(memberName, typeSearched, null)
        {
        }

        public MemberNotFoundException(string memberName, System.Type typeSearched, string addlInfo)
            : this(memberName, typeSearched, addlInfo, null)
        {
        }

        public MemberNotFoundException(string memberName, System.Type typeSearched, string addlInfo, Exception innerException)
            : base(FormatMessage(memberName, typeSearched, addlInfo), innerException)
        {
        }

        public MemberNotFoundException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }

        private static string FormatMessage(string memberName, System.Type typeSearched, string addlInfo)
        {
            var addlStr = string.IsNullOrEmpty(addlInfo) ? string.Empty : addlInfo.TrimEnd('.') + ". ";
            var typeName = (typeSearched != null) ? typeSearched.ToString() : "[Type Not Provided]";
            return string.Format("{2}Could not find member named '{0}' in type '{1}'.", memberName, typeName, addlStr);
        }
    }
}
