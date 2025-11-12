using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace GroceryStore.Infrastructure.Logging
{
    //through this we log the sql queries like insert , update ,delete ,select 
    public class ConsoleCommandInterceptor : DbCommandInterceptor
    {
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
        {
            Console.WriteLine($"[EF CMD] {command.CommandText}");  
            return base.ReaderExecuting(command, eventData, result);
        }
    }
}

