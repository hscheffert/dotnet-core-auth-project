using System;
using System.Collections;

namespace NetCoreAuth.Core
{
    public static class ObjectExtensions
    {
        public static bool IsEnumerable(this object source)
        {
            if (source == null)
            {
                return false;
            }

            return IsEnumerable(source.GetType());
        }

        public static bool IsEnumerable(Type t)
        {
            return typeof(IEnumerable).IsAssignableFrom(t) && t != typeof(string);
        }

        public static T ToClass<T>(this object source)
        {
            throw new NotImplementedException();
        }
    }
}
