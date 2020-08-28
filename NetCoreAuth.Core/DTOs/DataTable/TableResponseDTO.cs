using System.Collections.Generic;

namespace NetCoreAuth.Core.DTOs
{
    public class TableResponseDTO<T>
    {
        public TableResponseDTO(T[] data, int totalRecordCount, int filteredRecordCount, T sum, int echo)
        {
            this.Results = data;
            this.TotalCount = totalRecordCount;
            this.FilteredCount = filteredRecordCount;
            this.SumResult = sum;
            this.Echo = echo;
        }

        public int TotalCount { get; set; }
        public int FilteredCount { get; set; }
        public int Echo { get; set; }
        public T SumResult { get; set; }
        public IEnumerable<T> Results { get; set; }
    }
}
