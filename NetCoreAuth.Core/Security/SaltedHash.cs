using System;
using System.Collections.Generic;
using System.Text;

namespace NetCoreAuth.Core.Security
{
    public class SaltedHash
    {
        public string Hash { get; set; }
        public string Salt { get; set; }
    }
}
