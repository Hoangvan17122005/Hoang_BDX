namespace FirebaseFormApi.Models
{
    public class FormData
    {
        public string Fname { get; set; } = string.Empty;
        public string Lname { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public int Number { get; set; } // nếu bạn dùng <input type="number"> thì nên dùng int
        public string Major { get; set; } = string.Empty;
        public string Hehee { get; set; } = string.Empty;
    }
}
