namespace NetCoreAuth.Core
{
    public class LoginResponseDTO
    {
        public bool IsAuthenticated { get; set; }
        public string Message { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string UserId { get; set; }
    }
}
