namespace NetCoreAuth.Core.Exceptions
{
    public class EndUserException : ExceptionBase
    {
        public override bool IsUserFriendly => true;

        public EndUserException() : base()
        {
        }

        public EndUserException(string message) : base(message)
        {
        }
    }
}
