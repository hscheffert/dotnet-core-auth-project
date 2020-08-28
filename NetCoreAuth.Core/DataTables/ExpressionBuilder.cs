using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;

namespace NetCoreAuth.Core
{
    internal static class ExpressionBuilder
    {
        private static ICustomTypeDescriptor GetTypeDescriptor(Type type)
        {
            return new AssociatedMetadataTypeTypeDescriptionProvider(type).GetTypeDescriptor(type);
        }

        public static Expression ReplaceParameter(Expression expr, ParameterExpression from, ParameterExpression to)
        {
            return new SwapVisitor(from, to).Visit(expr);
        }

        public static LambdaExpression CreateLambdaToProperty(Type type, string propertyName)
        {
            var param = Expression.Parameter(type, "zzz");
            return CreateLambdaToProperty(param, propertyName);
        }

        public static LambdaExpression CreateLambdaToProperty(ParameterExpression param, string propertyName)
        {
            Type type = param.Type;

            // try to find a property on the query type that matches the column name
            PropertyDescriptor propertyDescriptor = GetTypeDescriptor(type).GetProperties().Find(propertyName, true);
            if (propertyDescriptor == null)
            {
                throw new ArgumentException("No property could be found named '" + propertyName + "' within type '" + type.FullName + "'.");
            }

            // create a property access expression for the target column/property
            return Expression.Lambda(Expression.Property(param, propertyDescriptor.Name), param);
        }


        public static Expression BuildFilterExpression(Expression expr, string searchString)
        {
            if (expr == null)
            {
                throw new ArgumentNullException("expr");
            }
            if (string.IsNullOrWhiteSpace(searchString))
            {
                throw new ArgumentNullException("searchString");
            }


            // we're done if the expression is not a member access (it's already in final form)
            if (expr.NodeType != ExpressionType.MemberAccess && expr.NodeType != ExpressionType.Call)
            {
                return expr;
            }

            // add '.Value' to the end of the expression if it's a nullable type
            if (expr.Type.IsGenericType && expr.Type.GetGenericTypeDefinition() == typeof(Nullable<>))
            {
                expr = Expression.Property(expr, "Value");
            }

            // build the correct filter expression based on 
            var typeCode = Type.GetTypeCode(expr.Type);
            switch (typeCode)
            {
                case TypeCode.String:
                    return CreateStringFilter(expr, searchString);
                case TypeCode.Int32:
                    //TODO: how do we support all the other int types?!?
                    return CreateIntegerFilter(expr, searchString);
                case TypeCode.Decimal:
                    return CreateDecimalFilter(expr, searchString);
                case TypeCode.DateTime:
                    return CreateDateFilter(expr, searchString);
                case TypeCode.Boolean:
                    return CreateBooleanFilter(expr, searchString);
                default:
                    //todo: what about datetimeoffset?
                    throw new NotSupportedException("Filtering on expressions of type '" + expr.Type.Name + "' is not yet supported.");
            }
        }


        public static Expression CreateStringFilter(Expression valueExpr, string searchString)
        {
            if (valueExpr.Type != typeof(string))
            {
                throw new ArgumentException("Expression passed does not return a string.");
            }

            return Expression.Call(valueExpr, "Contains", null, Expression.Constant(searchString));
        }


        public static Expression CreateDecimalFilter(Expression valueExpr, string searchString)
        {
            if (valueExpr.Type != typeof(decimal))
            {
                throw new ArgumentException("Expression passed does not return an integer.");
            }

            // trying to split on hyphen to get a range
            string[] rangeParts = searchString.Split('-');
            if (rangeParts.Length == 0)
            {
                return null;
            }

            // parse the first (or only) value
            decimal? start = null;
            if (!string.IsNullOrWhiteSpace(rangeParts[0]))
            {
                decimal value;
                if (!decimal.TryParse(rangeParts[0], out value))
                {
                    return null;
                }
                start = value;
            }

            // parse as a range if more than one component present
            if (rangeParts.Length > 1)
            {
                decimal? end = null;
                if (!string.IsNullOrWhiteSpace(rangeParts[1]))
                {
                    decimal value;
                    if (!decimal.TryParse(rangeParts[1], out value))
                    {
                        return null;
                    }
                    end = value;
                }

                return CreateDecimalRangeFilter(valueExpr, start, end);
            }

            return (start.HasValue) ? Expression.Equal(valueExpr, Expression.Constant(start.Value)) : null;
        }

        private static Expression CreateDecimalRangeFilter(Expression valueExpr, decimal? start, decimal? end)
        {
            // both sides can't both be null
            if (!start.HasValue && !end.HasValue)
            {
                return null;
            }

            // fix values if they are backward
            if (start.HasValue && end.HasValue && start > end)
            {
                // keep adding values of 10 to the end until it is greater or equal start
                //TODO: remove this behavior... is it a 'surprise' feature?
                while (start > end)
                {
                    end = end.Value * 10;
                }
            }

            Expression startExpr = null;
            if (start.HasValue)
            {
                startExpr = Expression.GreaterThanOrEqual(valueExpr, Expression.Constant(start.Value));
            }

            Expression endExpr = null;
            if (end.HasValue)
            {
                endExpr = Expression.LessThanOrEqual(valueExpr, Expression.Constant(end.Value));
            }

            Expression combined = null;
            if (startExpr != null)
            {
                combined = (combined == null) ? startExpr : Expression.And(combined, startExpr);
            }
            if (endExpr != null)
            {
                combined = (combined == null) ? endExpr : Expression.And(combined, endExpr);
            }

            return combined;
        }


        public static Expression CreateIntegerFilter(Expression valueExpr, string searchString)
        {
            if (valueExpr.Type != typeof(int))
            {
                throw new ArgumentException("Expression passed does not return an integer.");
            }

            // trying to split on hyphen to get a range
            string[] rangeParts = searchString.Split('-');
            if (rangeParts.Length == 0)
            {
                return null;
            }

            // parse the first (or only) value
            int? start = null;
            if (!string.IsNullOrWhiteSpace(rangeParts[0]))
            {
                int value;
                if (!int.TryParse(rangeParts[0], out value))
                {
                    return null;
                }
                start = value;
            }

            // parse as a date range if more than one component present
            if (rangeParts.Length > 1)
            {
                int? end = null;
                if (!string.IsNullOrWhiteSpace(rangeParts[1]))
                {
                    int value;
                    if (!int.TryParse(rangeParts[1], out value))
                    {
                        return null;
                    }
                    end = value;
                }

                return CreateIntegerRangeFilter(valueExpr, start, end);
            }

            return (start.HasValue) ? Expression.Equal(valueExpr, Expression.Constant(start.Value)) : null;
        }

        private static Expression CreateIntegerRangeFilter(Expression valueExpr, int? start, int? end)
        {
            // both sides can't both be null
            if (!start.HasValue && !end.HasValue)
            {
                return null;
            }

            // fix values if they are backward
            if (start.HasValue && end.HasValue && start > end)
            {
                // keep adding values of 10 to the end until it is greater or equal start
                //TODO: remove this behavior... is it a 'surprise' feature?
                while (start > end)
                {
                    end = end.Value * 10;
                }
            }

            Expression startExpr = null;
            if (start.HasValue)
            {
                startExpr = Expression.GreaterThanOrEqual(valueExpr, Expression.Constant(start.Value));
            }

            Expression endExpr = null;
            if (end.HasValue)
            {
                endExpr = Expression.LessThanOrEqual(valueExpr, Expression.Constant(end.Value));
            }

            Expression combined = null;
            if (startExpr != null)
            {
                combined = (combined == null) ? startExpr : Expression.And(combined, startExpr);
            }
            if (endExpr != null)
            {
                combined = (combined == null) ? endExpr : Expression.And(combined, endExpr);
            }

            return combined;
        }


        public static Expression CreateDateFilter(Expression valueExpr, string searchString)
        {
            // standard syntax:
            // - "6" -> month 6, any day, any year //current year
            // - "6/" -> month 6, any day, any year //current year
            // - 2011 -> year 2011, any month, any day
            // - "6/27" -> month 6, day 27, any year //current year
            // - "6/27/" -> month 6, day 27, any year //current year
            // - "6/27/11" -> exactly 6/27/2011
            // - "6/27/2011" -> exactly 6/27/2011

            // wildcard syntax:
            // - "6//13" -> month 6, any day, year 2013
            // - "6/*/13" -> month 6, any day, year 2013

            // date range syntax:
            // - "6-" -> on or after 6/1/[current year]
            // - "6/27-" -> on or after 6/27/[current year]
            // - "6/27/11-" -> on or after 6/27/2011
            // - "-6" -> on or before 5/31/[current year] (note: do not include end date)
            // - "-6/27" -> on or before 6/27/[current year]
            // - "-6/27/11-" -> on or before 6/27/2011

            // - "6/27-9" -> between 6/27/[current year] and 9/1/[current year] 
            // - "6/27-9/30" -> between 6/27/[current year] and 9/30/[current year]
            // - "6/27-2/5" -> between 6/27/[current year] and 2/5/[current year + 1]
            // - "6/27/11-9/" -> between 6/27/2011 and 9/1/2011
            // - "6/27/11-2/" -> between 6/27/2011 and 2/1/2012 (rounded to next year to keep start before end)
            // - "6/27/11-2/5" -> between 6/27/2011 and 2/5/2012
            // - "6/27/11-2/5/15" -> between 6/27/2011 and 2/5/2015

            // possible v.Next syntax:
            // - "m7" -> month 7
            // - "d23" -> day 23
            // - "y13" -> year 2013
            // - "y2013" -> year 2013

            if (valueExpr.Type != typeof(DateTime))
            {
                throw new ArgumentException("Expression passed does not return a DateTime.");
            }

            // trying to split on hyphen to get a range
            string[] rangeParts = searchString.Split('-');
            if (rangeParts.Length == 0)
            {
                return null;
            }

            // parse the first (or only) component
            DateParts start;
            if (!TryParseDate(rangeParts[0], out start))
            {
                return null;
            }

            // parse as a date range if more than one component present
            if (rangeParts.Length > 1)
            {
                DateParts end;
                if (!TryParseDate(rangeParts[1], out end))
                {
                    return null;
                }

                return CreateDateRangeFilter(valueExpr, start, end);
            }

            if (start.Blank)
            {
                return null;
            }

            //// do an exact data match if at least month and day are specified
            //if (start.Month.HasValue && start.Day.HasValue)
            //{
            //    return Expression.Equal(valueExpr, Expression.Constant(start.BestFitDate));
            //}

            // filter on month
            Expression monthExpr = null;
            if (start.Month.HasValue)
            {
                monthExpr = Expression.Equal(Expression.Property(valueExpr, "Month"), Expression.Constant(start.Month.Value));
            }

            // filter on day
            Expression dayExpr = null;
            if (start.Day.HasValue)
            {
                dayExpr = Expression.Equal(Expression.Property(valueExpr, "Day"), Expression.Constant(start.Day.Value));
            }

            // filter on year
            // TODO: changed by Chris because if the user hasn't typed a year, I don't want to filter on it
            Expression yearExpr = null;
            if (start.Year.HasValue)// || start.Month.HasValue)
            {
                int targetYear = start.Year.Value;// start.BestFitDate.Value.Year;
                yearExpr = Expression.Equal(Expression.Property(valueExpr, "Year"), Expression.Constant(targetYear));
            }

            Expression combined = null;
            if (monthExpr != null)
            {
                combined = (combined == null) ? monthExpr : Expression.And(combined, monthExpr);
            }
            if (dayExpr != null)
            {
                combined = (combined == null) ? dayExpr : Expression.And(combined, dayExpr);
            }
            if (yearExpr != null)
            {
                combined = (combined == null) ? yearExpr : Expression.And(combined, yearExpr);
            }

            return combined;
        }

        public static Expression<Func<TSource, TResult>> CombineSelectors<TSource, TResult>(Expression<Func<TSource, TResult>> mainSelector, LambdaExpression otherSelector)
        {
            var init = mainSelector.Body as MemberInitExpression;
            var other = otherSelector.Body as MemberInitExpression;
            var newBindings = init.Bindings.Concat(other.Bindings);
            init = init.Update(init.NewExpression, newBindings);
            mainSelector = mainSelector.Update(init, mainSelector.Parameters);
            return ReplaceParameter
                    (
                        mainSelector,
                        otherSelector.Parameters[0],
                        mainSelector.Parameters[0]
                    ) as Expression<Func<TSource, TResult>>;
        }

        public static Expression<Func<TSource, TResult>> RemoveBindings<TSource, TResult>(Expression<Func<TSource, TResult>> selector, params string[] toRemove)
        {
            var init = selector.Body as MemberInitExpression;
            var newBindings = init.Bindings.Where(a => !toRemove.Contains(a.Member.Name));
            init = init.Update(init.NewExpression, newBindings);
            return selector.Update(init, selector.Parameters);
        }

        public static Expression<Func<TSource, TResult>> RemoveBindings<TSource, TResult>(Expression<Func<TSource, TResult>> selector, Func<TResult, string[]> toRemove) where TResult : class
        {
            return RemoveBindings(selector, toRemove(null));
        }


        private static string GetName<TSource, TValue>(Expression<Func<TSource, TValue>> exp)
        {
            MemberExpression body = exp.Body as MemberExpression;

            if (body == null)
            {
                UnaryExpression ubody = (UnaryExpression)exp.Body;
                body = ubody.Operand as MemberExpression;
            }

            return body.Member.Name;
        }

        private static Expression CreateDateRangeFilter(Expression valueExpr, DateParts start, DateParts end)
        {
            // both sides can't both be blank
            if (start.Blank && end.Blank)
            {
                return null;
            }

            // start must either be blank or enough to be a specific date
            if (!(start.Blank || start.HasMonthAndDay))
            {
                return null;
            }

            // end must either be blank or enough to be a specific date
            if (!(end.Blank || end.HasMonthAndDay))
            {
                return null;
            }

            DateTime? startDate = (start.HasMonthAndDay) ? start.BestFitDate : null;
            DateTime? endDate = (end.HasMonthAndDay) ? end.BestFitDate : null;

            // try to fix the dates if end is on or before start
            if (startDate.HasValue && endDate.HasValue && startDate >= endDate)
            {
                if (start.HasMonthDayYear && end.HasMonthDayYear)
                {
                    // swap dates
                    var temp = startDate;
                    startDate = endDate;
                    endDate = temp;
                }
                else if (!start.HasMonthDayYear && !end.HasMonthDayYear)
                {
                    // add a year to end
                    endDate = endDate.Value.AddYears(1);
                }
            }

            Expression startExpr = null;
            if (startDate.HasValue)
            {
                startExpr = Expression.GreaterThanOrEqual(valueExpr, Expression.Constant(startDate.Value));
            }

            Expression endExpr = null;
            if (endDate.HasValue)
            {
                endExpr = Expression.LessThanOrEqual(valueExpr, Expression.Constant(endDate.Value));
            }

            Expression combined = null;
            if (startExpr != null)
            {
                combined = (combined == null) ? startExpr : Expression.And(combined, startExpr);
            }
            if (endExpr != null)
            {
                combined = (combined == null) ? endExpr : Expression.And(combined, endExpr);
            }

            return combined;
        }

        private static bool TryParseDate(string dateString, out DateParts dateParts)
        {
            if (dateString == null)
            {
                throw new ArgumentNullException("dateString");
            }

            dateParts = new DateParts();

            if (string.IsNullOrEmpty(dateString))
            {
                return true;
            }

            // split the string on slashes; exit if too many parts
            string[] parts = dateString.Split('/');
            if (parts.Length > 3)
            {
                return false;
            }

            var result = new DateParts();

            // parse month component (must exist to get here)
            int mm;
            if (!int.TryParse(parts[0], out mm))
            {
                return false;
            }
            int? month = mm;

            // parse day component if provided
            int? day = null;
            if (parts.Length > 1)
            {
                if (parts[1].Length > 0)
                {
                    int dd;
                    if (!int.TryParse(parts[1], out dd))
                    {
                        return false;
                    }
                    day = dd;
                }
            }

            // parse year component if provided
            int? year = null;
            if (parts.Length > 2)
            {
                if (parts[2].Length > 0)
                {
                    int yy;
                    if (!int.TryParse(parts[2], out yy))
                    {
                        return false;
                    }
                    year = yy;
                }
            }

            // build and a test string to verify components (and resolve 2-digit years)
            string dateStr = month.Value + "/" + (day ?? 1) + (year.HasValue ? "/" + year.Value : null);

            // try to parse the constructed date
            DateTime bestFitDate;
            if (!DateTime.TryParse(dateStr, out bestFitDate))
            {
                return false;
            }

            // return the results
            dateParts = new DateParts() { Month = month, Day = day, Year = year, BestFitDate = bestFitDate };
            return true;
        }


        public static Expression CreateBooleanFilter(Expression valueExpr, string searchString)
        {
            if (valueExpr.Type != typeof(bool))
            {
                throw new ArgumentException("Expression passed does not return a boolean value.");
            }

            bool filter;
            if (!Boolean.TryParse(searchString, out filter))
            {
                //throw new ArgumentException("Search string could not be evaluated to a boolean value.  'True' or 'False' must be used (case insensitive).");

                // Hard to tell what's a boolean compare column. Just return the expression of searchString is not true or false
                return valueExpr;
            }

            return Expression.Equal(valueExpr, Expression.Constant(filter));
        }


        private class DateParts
        {
            public int? Month;
            public int? Day;
            public int? Year;
            public DateTime? BestFitDate;

            public bool Blank
            {
                get { return !(this.Month.HasValue || this.Day.HasValue || this.Year.HasValue); }
            }

            public bool HasMonthDayYear
            {
                get { return (this.Month.HasValue && this.Day.HasValue && this.Year.HasValue); }
            }

            public bool HasMonthAndDay
            {
                get { return (this.Month.HasValue && this.Day.HasValue); }
            }
        }


        private class SwapVisitor : ExpressionVisitor
        {
            private readonly Expression from;
            private readonly Expression to;

            public SwapVisitor(Expression from, Expression to)
            {
                this.from = from;
                this.to = to;
            }

            public override Expression Visit(Expression node)
            {
                return (node == this.from) ? this.to : base.Visit(node);
            }
        }
    }
}