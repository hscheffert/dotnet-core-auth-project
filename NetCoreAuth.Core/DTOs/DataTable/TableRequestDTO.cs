using System;
using System.Collections.Generic;

namespace NetCoreAuth.Core.DTOs
{
    public class TableRequestDTO
    {
        public int Page { get; set; }
        public int PageLength { get; set; }
        public string SortField { get; set; }
        public string SortOrder { get; set; }
        public string GlobalFilter { get; set; }
        public int Echo { get; set; }
        // Filters
        public List<TableRequestFilterDTO> Filters { get; set; }

        public string[] SplitGlobalFilters()
        {
            return GlobalFilter != null ? GlobalFilter.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries) : new string[0];
        }
    }
}
