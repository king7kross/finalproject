using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace GroceryStore.Infrastructure.Logging
{
    public class ConsoleCommandInterceptor : DbCommandInterceptor
    {
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
        {
            Console.WriteLine($"[EF CMD] {command.CommandText}"); // required by spec to log DB commands 
            return base.ReaderExecuting(command, eventData, result);
        }
    }
}

