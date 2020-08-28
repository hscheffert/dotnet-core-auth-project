using NetCoreAuth.Core.DTOs;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace NetCoreAuth.Core.DataTables
{
    public abstract class DataTablesProvider<TQuery, TOut>
    {
        private delegate IQueryable<TQuery> OrderByDelegate(IQueryable<TQuery> query, LambdaExpression keySelector, bool firstSortColumn, bool inDescendingOrder);

        private static ConcurrentDictionary<Type, OrderByDelegate> s_orderByDelegateByType = new ConcurrentDictionary<Type, OrderByDelegate>();

        public int FilteredCount { get; set; }

        public virtual TableResponseDTO<TOut> ExecuteRequest(TableRequestDTO request)
        {
            var baseQuery = GetBaseQuery(request);

            // get the total records if requested to do so
            int totalCount = -1; //TODO: what is the correct default? null?
            if (this.CountTotalRecords)
            {
                totalCount = baseQuery.Count();
            }

            // apply column filtering
            var columnFilteredQuery = AddFiltering(baseQuery, request);
            var filteredQuery = AddGlobalFiltering(columnFilteredQuery, request);

            // get the total records if requested to do so
            this.FilteredCount = -1; //TODO: what is the correct default? null?
            if (this.CountFilteredRecords)
            {
                this.FilteredCount = filteredQuery.Count();
            }

            TOut sumResult = default(TOut);
            if (this.SumRecords)
            {
                sumResult = this.BuildSumResult(filteredQuery);
            }

            // apply sorting and paging
            var sortedQuery = AddSorting(filteredQuery, request);
            var pagedQuery = AddPaging(sortedQuery, request);

            // project the records into output form
            var trasformedResults = TransformResults(pagedQuery);
            var projectedData = trasformedResults.AsEnumerable().Cast<TOut>().ToArray();

            var results = PostProcessResults(projectedData).ToArray();

            // return the results in a response container
            return new TableResponseDTO<TOut>(results, totalCount, this.FilteredCount, sumResult, request.Echo);
        }

        public virtual List<TOut> ExecuteRequestForExport(TableRequestDTO request)
        {
            var baseQuery = GetBaseQuery(request);

            // apply column filtering
            var columnFilteredQuery = AddFiltering(baseQuery, request);
            var filteredQuery = AddGlobalFiltering(columnFilteredQuery, request);

            // apply sorting and paging
            var sortedQuery = AddSorting(filteredQuery, request);
            //var pagedQuery = AddPaging(sortedQuery, request);

            // project the records into output form and execute
            var results = TransformResults(sortedQuery).ToList();
            this.FilteredCount = results.Count;

            results = PostProcessResults(results).ToList();

            return results;
        }

        protected virtual bool CountTotalRecords
        {
            get { return true; }
        }

        protected virtual bool CountFilteredRecords
        {
            get { return true; }
        }

        protected virtual bool SumRecords
        {
            get { return false; }
        }

        protected virtual char[] FilterSeparatorCharacters
        {
            get { return new char[] { ',' }; }
        }

        protected abstract IQueryable<TQuery> GetBaseQuery(TableRequestDTO request);

        protected virtual Filter GetColumnFilter(string columnName, string searchString)
        {
            return ColumnFilter();
        }

        protected virtual Filter GetGlobalFilter(string searchString)
        {
            return ColumnFilter();
        }

        protected virtual OrderByExpression GetOrderBy(string columnName)
        {
            return OrderBy();
        }

        protected virtual IQueryable<TOut> TransformResults(IQueryable<TQuery> results)
        {
            // TODO: Default doesn't work anymore (right?)
            return results.Cast<TOut>();
        }

        protected virtual IEnumerable<TOut> PostProcessResults(IEnumerable<TOut> results)
        {
            return results;
        }

        protected virtual TOut BuildSumResult(IQueryable<TQuery> results)
        {
            return default(TOut);
        }

        private IQueryable<TQuery> AddFiltering(IQueryable<TQuery> query, TableRequestDTO request)
        {
            ParameterExpression itemParam = Expression.Parameter(typeof(TQuery), "x");
            Expression combinedExpr = null;

            // add column-specific filter predicates to the expression with an AND
            if (request.Filters != null)
            {
                for (int i = 0; i < request.Filters.Count; i++)
                {
                    var column = request.Filters[i];
                    if (!string.IsNullOrWhiteSpace(column.Filter))
                    {
                        // Break the search string up by the break characters and add multiple filters if there are multiple
                        string[] searchStrings = column.Filter.Split(this.FilterSeparatorCharacters, StringSplitOptions.RemoveEmptyEntries);
                        Expression combinedOrExpr = null;

                        for (int j = 0; j < searchStrings.Length; j++)
                        {
                            string searchTerm = searchStrings[j].Trim();

                            if (string.IsNullOrWhiteSpace(searchTerm))
                            {
                                continue;
                            }

                            if (!string.IsNullOrWhiteSpace(column.ColumnProp))
                            {
                                column.ColumnProp = column.ColumnProp.Substring(0, 1).ToUpper() + column.ColumnProp.Substring(1);
                            }

                            var filter = GetColumnFilter(column.ColumnProp, searchTerm);

                            if (filter != null)
                            {
                                var filterExpression = BuildFilterExpression(filter, itemParam, column.ColumnProp, searchTerm);

                                if (filterExpression != null)
                                {
                                    // OR the predicate to the expression
                                    combinedOrExpr = (combinedOrExpr == null) ? filterExpression : Expression.Or(combinedOrExpr, filterExpression);
                                }
                                else // invalid search string
                                {
                                    combinedOrExpr = Expression.Equal(Expression.Constant(1), Expression.Constant(0));
                                }
                            }
                        }

                        // AND the predicate to the expression
                        combinedExpr = (combinedExpr == null) ? combinedOrExpr : Expression.AndAlso(combinedExpr, combinedOrExpr);
                    }
                }
            }

            // just return the original query unmodified if no filtering was produced above
            if (combinedExpr == null)
            {
                return query;
            }

            // apply the filter expression to the Where clause of the query
            var combinedLambda = Expression.Lambda<Func<TQuery, bool>>(combinedExpr, itemParam);
            return query.Where(combinedLambda);
        }


        private IQueryable<TQuery> AddGlobalFiltering(IQueryable<TQuery> query, TableRequestDTO request)
        {
            ParameterExpression itemParam = Expression.Parameter(typeof(TQuery), "x");
            Expression combinedExpr = null;

            if (!string.IsNullOrWhiteSpace(request.GlobalFilter))
            {
                // Break the search string up by the break characters and add multiple filters if there are multiple
                string[] globalSearchStrings = request.GlobalFilter.Split(this.FilterSeparatorCharacters, StringSplitOptions.RemoveEmptyEntries);
                Expression combinedOrExpr = null;

                for (int j = 0; j < globalSearchStrings.Length; j++)
                {
                    string searchTerm = globalSearchStrings[j].Trim();

                    if (string.IsNullOrWhiteSpace(searchTerm))
                    {
                        continue;
                    }

                    var filter = GetGlobalFilter(searchTerm);
                    //todo: consider an OnAfter method as a possible extension point
                    //filter = OnAfterGetColumnFilter(filter, column.columnProp, searchTerm);

                    if (filter != null)
                    {
                        var filterExpression = BuildGlobalFilterExpression(filter, itemParam, searchTerm);

                        if (filterExpression != null)
                        {
                            // AND the predicate to the expression
                            combinedOrExpr = (combinedOrExpr == null) ? filterExpression : Expression.AndAlso(combinedOrExpr, filterExpression);
                        }
                        else // invalid search string
                        {
                            combinedOrExpr = Expression.Equal(Expression.Constant(1), Expression.Constant(0));
                        }
                    }
                }

                // AND the predicate to the expression
                combinedExpr = (combinedExpr == null) ? combinedOrExpr : Expression.AndAlso(combinedExpr, combinedOrExpr);
            }

            // just return the original query unmodified if no filtering was produced above
            if (combinedExpr == null)
            {
                return query;
            }

            // apply the filter expression to the Where clause of the query
            var combinedLambda = Expression.Lambda<Func<TQuery, bool>>(combinedExpr, itemParam);
            return query.Where(combinedLambda);
        }

        private IQueryable<TQuery> AddSorting(IQueryable<TQuery> query, TableRequestDTO request)
        {
            //TODO: support multiple column sorting??
            //if (request.order.Count > 0 && request.order.First().column >= 0 && request.columns.Count > 0)
            //{
            //if (!string.IsNullOrWhiteSpace(request.sortField))
            //{
            if (!string.IsNullOrWhiteSpace(request.SortField))
            {
                request.SortField = request.SortField.Substring(0, 1).ToUpper() + request.SortField.Substring(1);
            }
            var orderBy = GetOrderBy(request.SortField);
            //todo: consider an OnAfter method as a possible extension point
            //orderBy = OnAfterGetOrderBy(orderBy, request.sortField);

            if (orderBy != null)
            {
                bool inReverseOrder = (request.SortOrder?.ToLower() == "descend");

                return AddOrderByToQuery(query, orderBy, request.SortField, inReverseOrder);
            }
            //}
            //}

            // just return the original query unmodified since no sorting was produced above
            return query;
        }

        private IQueryable<TQuery> AddPaging(IQueryable<TQuery> query, TableRequestDTO request)
        {
            if (request.Page > 0 && request.PageLength > -1)
            {
                query = query.Skip(request.Page * request.PageLength);
            }

            if (request.PageLength > 0) //TODO: review -1 or 0? Does Take(0) make since in any scenario?
            {
                query = query.Take(request.PageLength);
            }

            return query;
        }

        private Expression BuildFilterExpression(Filter filter, ParameterExpression itemParam, string columnName, string searchString)
        {
            if (string.IsNullOrWhiteSpace(searchString))
            {
                throw new ArgumentNullException("searchString");
            }

            // switch to the modified search string if provided in the filter
            if (!string.IsNullOrWhiteSpace(filter.CustomSearchString))
            {
                searchString = filter.CustomSearchString;
            }

            LambdaExpression lambda = filter.Expression;

            // if no expression was specified in the filter, create a convention-based property access expression using the column name
            if (lambda == null)
            {
                lambda = ExpressionBuilder.CreateLambdaToProperty(typeof(TQuery), columnName);
            }

            // verify the lambda has exactly one parameter
            if (lambda.Parameters.Count != 1)
            {
                throw new ArgumentException("Expected lambda expression to have exactly one parameter, not " + lambda.Parameters.Count + ".");
            }

            // verify the lambda's parameter is the correct type
            if (lambda.Parameters[0].Type != typeof(TQuery))
            {
                throw new ArgumentException("Expected lambda expression parameter to be of type '" + typeof(TQuery) + "', not '" + lambda.Parameters[0].Type + "'.");
            }

            // pull out the body and replace all parameter references with the one passed by the caller
            Expression valueExpr = ExpressionBuilder.ReplaceParameter(lambda.Body, lambda.Parameters[0], itemParam);

            // build the filter expression
            var filterExpr = ExpressionBuilder.BuildFilterExpression(valueExpr, searchString);

            return filterExpr;
        }

        private Expression BuildGlobalFilterExpression(Filter filter, ParameterExpression itemParam, string searchString)
        {
            if (string.IsNullOrWhiteSpace(searchString))
            {
                throw new ArgumentNullException("searchString");
            }

            // switch to the modified search string if provided in the filter
            if (!string.IsNullOrWhiteSpace(filter.CustomSearchString))
            {
                searchString = filter.CustomSearchString;
            }

            LambdaExpression lambda = filter.Expression;

            // if no expression was specified in the filter, create a convention-based property access expression using the column name
            if (lambda == null)
            {
                throw new ArgumentException("No lambda expression for global filtering was provided.");
            }

            // verify the lambda has exactly one parameter
            if (lambda.Parameters.Count != 1)
            {
                throw new ArgumentException("Expected lambda expression to have exactly one parameter, not " + lambda.Parameters.Count + ".");
            }

            // verify the lambda's parameter is the correct type
            if (lambda.Parameters[0].Type != typeof(TQuery))
            {
                throw new ArgumentException("Expected lambda expression parameter to be of type '" + typeof(TQuery) + "', not '" + lambda.Parameters[0].Type + "'.");
            }

            // pull out the body and replace all parameter references with the one passed by the caller
            Expression valueExpr = ExpressionBuilder.ReplaceParameter(lambda.Body, lambda.Parameters[0], itemParam);

            // build the filter expression
            var filterExpr = ExpressionBuilder.BuildFilterExpression(valueExpr, searchString);

            return filterExpr;
        }

        private IQueryable<TQuery> AddOrderByToQuery(IQueryable<TQuery> query, OrderByExpression orderBy, string columnName, bool inReverseOrder)
        {
            if (orderBy == null)
            {
                throw new ArgumentNullException("orderBy");
            }

            var stack = new Stack<OrderByExpression>();

            // create the global parameter reference all expressions need to use
            var itemParam = Expression.Parameter(typeof(TQuery), "x");

            for (var item = orderBy; item != null; item = item.Parent)
            {
                LambdaExpression lambda = item.KeySelector;

                // if no expression was specified in the filter, create a convention-based property access expression using the column name
                if (lambda == null)
                {
                    lambda = ExpressionBuilder.CreateLambdaToProperty(typeof(TQuery), columnName);
                }

                // verify the lambda has exactly one parameter
                if (lambda.Parameters.Count != 1)
                {
                    throw new ArgumentException("Expected lambda expression to have exactly one parameter, not " + lambda.Parameters.Count + ".");
                }

                // verify the lambda's parameter is the correct type
                if (lambda.Parameters[0].Type != typeof(TQuery))
                {
                    throw new ArgumentException("Expected lambda expression parameter to be of type '" + typeof(TQuery) + "', not '" + lambda.Parameters[0].Type + "'.");
                }

                // pull out the body replace all parameter references with our instance, and put back into lambda
                Expression newBody = ExpressionBuilder.ReplaceParameter(lambda.Body, lambda.Parameters[0], itemParam);
                lambda = Expression.Lambda(newBody, itemParam);

                // push this lambda on the stack
                stack.Push(new OrderByExpression(lambda, item.InDescendingOrder));
            }

            // build the query sort expression: query.OrderBy().ThenBy().ThenByDescending()...
            bool isFirstColumn = true;
            foreach (OrderByExpression order in stack)
            {
                Type keyType = order.KeySelector.Body.Type;

                var methodDelegate = s_orderByDelegateByType.GetOrAdd(keyType, (key) => BuildOrderByDelegate(key));

                var useDecendingMethod = (order.InDescendingOrder ^ inReverseOrder);
                query = methodDelegate(query, order.KeySelector, isFirstColumn, useDecendingMethod);

                isFirstColumn = false;
            }

            return query;
        }

        private static OrderByDelegate BuildOrderByDelegate(Type keyType)
        {
            var args = new ParameterExpression[]
            {
                Expression.Parameter(typeof(IQueryable<TQuery>), "query"),
                Expression.Parameter(typeof(LambdaExpression), "keySelector"),
                Expression.Parameter(typeof(bool), "firstSortColumn"),
                Expression.Parameter(typeof(bool), "useDecendingMethod")
            };

            var callExpr = Expression.Lambda<OrderByDelegate>(
                Expression.Call(typeof(DataTablesProvider<TQuery, TOut>), "CallOrderBy", new[] { keyType }, args),
                args);

            var callDelegate = callExpr.Compile();

            return callDelegate;
        }

        private static IQueryable<TQuery> CallOrderBy<TKey>(IQueryable<TQuery> query, LambdaExpression keySelector, bool firstSortColumn, bool useDecendingMethod)
        {
            var selector = Expression.Lambda<Func<TQuery, TKey>>(keySelector.Body, keySelector.Parameters);

            if (firstSortColumn)
            {
                return (!useDecendingMethod) ? query.OrderBy(selector) : query.OrderByDescending(selector);
            }
            else
            {
                var orderedQuery = (IOrderedQueryable<TQuery>)query;
                return (!useDecendingMethod) ? orderedQuery.ThenBy(selector) : orderedQuery.ThenByDescending(selector);
            }
        }

        #region --- ColumnFilter Methods ---

        protected Filter ColumnFilter()
        {
            return new Filter(null, null);
        }

        protected Filter ColumnFilter(string modifiedSearchString)
        {
            return new Filter(null, modifiedSearchString);
        }

        protected Filter ColumnFilter<TValue>(Expression<Func<TQuery, TValue>> expression)
        {
            return new Filter(expression, null);
        }

        protected Filter ColumnFilter<TValue>(Expression<Func<TQuery, TValue>> expression, string modifiedSearchString)
        {
            if (expression.Body.NodeType != ExpressionType.MemberAccess)
            {
                throw new InvalidOperationException("This overload, with a modified search string, cannot be called with an expression of type '" + expression.Body.NodeType + "'. Only member access expressions are allowed.");
            }

            return new Filter(expression, modifiedSearchString);
        }

        #endregion --- ColumnFilter Methods ---

        #region --- OrderBy Methods ---

        protected OrderByExpression OrderBy()
        {
            return new OrderByExpression(null, false);
        }

        protected OrderByExpression OrderByDescending()
        {
            return new OrderByExpression(null, true);
        }

        protected OrderByExpression OrderBy<TValue>(Expression<Func<TQuery, TValue>> expression)
        {
            return new OrderByExpression(expression, false);
        }

        protected OrderByExpression OrderByDescending<TValue>(Expression<Func<TQuery, TValue>> expression)
        {
            return new OrderByExpression(expression, true);
        }

        #endregion --- OrderBy Methods ---

        protected class Filter
        {
            public Filter(LambdaExpression expression, string customSearchString)
            {
                this.Expression = expression;
                this.CustomSearchString = customSearchString;
            }

            public LambdaExpression Expression { get; private set; }

            public string CustomSearchString { get; private set; }
        }

        protected class OrderByExpression
        {
            public OrderByExpression(LambdaExpression keySelector, bool inDescendingOrder, OrderByExpression parent = null)
            {
                this.KeySelector = keySelector;
                this.InDescendingOrder = inDescendingOrder;
                this.Parent = parent;
            }

            public LambdaExpression KeySelector { get; private set; }

            public bool InDescendingOrder { get; private set; }

            public OrderByExpression Parent { get; private set; }

            public OrderByExpression ThenBy<TValue>(Expression<Func<TQuery, TValue>> keySelector)
            {
                return new OrderByExpression(keySelector, false, this);
            }

            public OrderByExpression ThenByDescending<TValue>(Expression<Func<TQuery, TValue>> keySelector)
            {
                return new OrderByExpression(keySelector, true, this);
            }
        }
    }
}
