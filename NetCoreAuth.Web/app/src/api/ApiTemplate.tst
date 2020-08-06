${
    using Typewriter.Extensions.WebApi;
    using Typewriter.Extensions.Types;
    
    // DEBUG STUFF
    static string debugInfo = "";
    public void Log(params string[] f) {
        debugInfo += string.Join(", ", f) + Environment.NewLine;
    }
    public string PrintDebugInfo(File f){
        var output = debugInfo;
        debugInfo = "";
        return f.Name + Environment.NewLine + output;
    }
    // END DEBUG STUFF

    // Class Variables
    static List<Type> GenericTypeList = new List<Type>();

    Template(Settings settings)
    {
        settings.PartialRenderingMode = PartialRenderingMode.Combined;
    }

    string ClassName(Class c) => c.Name;
    string ClassNameInternal(Class c) => c.Name + "Internal";

    string ReturnType(Method m)
    {
        return TypeReplacer(m.Type);
    }

    string RouteParameters(Method m) {
        var items = m.Parameters.Select(x => PropertyGenerator(x));
        return string.Join(", ", items);
    }

    string MethodParameters(Method m) {
        var items = m.Parameters.Select(x => PropertyGenerator(x));
        items = items.Append("requestOptions?: HttpApiRequestOptions");
        return string.Join(", ", items);
    }

    string UrlParameters(Method m) {
        var items = m.Parameters.Select(x => x.name);
        return string.Join(", ", items);
    }

    string TypeReplacer(Type t)
    {
        var className = t.Name;

        // Sanity check
        if (className.Length < 1)
        {
            return "";
        }

        // Dates are weird so just return a whole import here
        if (t.IsDate)
        {
            className = "Moment";
        }
        if (t.TypeArguments.Any(x => x.IsDate))
        {
            className = "Moment[]";
        }
        
        // Run other replacements such as Tuple
        if (className.StartsWith("Tuple"))
        {
            // Hacky but it works!
            className = $"Tuple{t.TypeParameters.Count}<{className.Split('<')[1]}";
        }
        if (className.StartsWith("KeyValuePair"))
        {
            // This is actually just a Tuple with extra steps
            className = $"Tuple{t.TypeParameters.Count}<{className.Split('<')[1]}";
        }
        if (className.StartsWith("IHttpActionResult") || className.StartsWith("IActionResult"))
        {
            // Nothing to return for these, just a reponse yes or no
            return "void";
        }

        return className;
    }
    
    string PropertyGenerator(Parameter p)
    {
        var className = TypeReplacer(p.Type);
        var nullable = p.Type.IsNullable ? "?" : "";

        return $"{p.name + nullable}: {className}";
    }

    // Our job is to remove the "<>"s and format a proper import statement
    string ImportGenerator(Type t)
    {
        Log("Logger", t.name);
        var className = t.Name;

        // Check for generic, which indicates DTO<T> or similar
        if (GenericTypeList.Any(x => x.Name == t.Name))
        {
            return "";
        }

        // Remove those which have no import
        if (className == "IHttpActionResult" || className == "IActionResult")
        {
            return "";
        }

        // Remove <>'s and []'s from generics and arrays
        className = className.Split('<')[0];
        className = className.Split('[')[0];

        // Dates are weird so just return a whole import here
        if (t.IsDate || t.TypeArguments.Any(x => x.IsDate))
        {
            return "import { Moment } from 'moment';";
        }
        
        // Run other replacements such as Tuple
        if (className == "Tuple")
        {
            // Name here comes out to Tuple1 or similar
            var tupleName = $"{{ Tuple{t.TypeParameters.Count} }}";
            return $"import {tupleName} from '../models/frontend/common/KeyValueAndSimilar';";
        }
        if (className == "KeyValuePair")
        {
            // This is actually just a Tuple with extra steps
            return "import { Tuple2 } from '../models/frontend/common/KeyValueAndSimilar';";
        }

        if(className == "void") return "";

        return $"import {className} from '../models/generated/{className}';";
    }

    string Imports(Class c)
    {
        Log("Running Import");
        try 
        {
            IEnumerable<Type> methodTypes = c.Methods.Select(x => x.Type);
            IEnumerable<Type> propTypes = c.Methods.SelectMany(m => m.Parameters).Select(x => x.Type);
            var types = methodTypes.Concat(propTypes);

            var propImports = types
                .Where(x => !x.IsPrimitive || x.IsDate || (x.TypeArguments.Any(x => x.IsDate))) // Remove Primitives but keep dates
                .SelectMany(m => m.TypeArguments.Where(x => !x.IsPrimitive).Append(m)) // Take props and generic type arguments and mash them into a single list
                .Where(x => x != null) // Remove nulls, mostly for the base class
                .Where(x => x.FullName != c.FullName) // Remove self as this can happen
                .Select(x => ImportGenerator(x)) // Turn types into fabulous import statements
                .Where(x => !string.IsNullOrWhiteSpace(x)) // Remove empty results for cleanliness
                .Distinct() // Make it unique!
                .OrderBy(x => x) // Alphabetize them
                .ToList();

            var output = string.Join(Environment.NewLine, propImports);
            return output.Length > 3 ? output + Environment.NewLine : "";
        }
        catch (Exception e)
        {
            return e.StackTrace;
        }
    }
    
    // Should be called first. Resets variables and gets list of generic variables + classes
    string Initialize(Class c) 
    {
        debugInfo = "";
        Log("Running Initialize");

        GenericTypeList = c.Properties
            .Where(x => x.Type.IsGeneric) // Get class props that indicate they are generic. eg, Tuple<T, int>
            .Select(x => x.Type.TypeArguments) // Get the type arguments. eg, T and int
            .Append(c.TypeArguments)
            .SelectMany(x => x)
            .Where(x => !x.IsPrimitive) // Remove primitives such as int. eg, T
            .ToList();
        
        Log("GenericTypeList: " + GenericTypeList.Count());
        Log(string.Join(", ", GenericTypeList.Select(x => x.Name)));

        return "";
    }
}$Classes(:ControllerBase)[import { HttpApi, HttpApiRequestOptions, AxiosResponse } from './ApiHelper';$Initialize
$Imports

class $ClassNameInternal {$Methods[
    // $HttpMethod: $Url
    public Route$Name = ($RouteParameters) => `$Url`;
    public $name($MethodParameters): Promise<AxiosResponse<$ReturnType>> {
        let url = this.Route$Name($UrlParameters);
        return HttpApi.RestRequest<any, $ReturnType>($RequestData, '$HttpMethod', url, requestOptions);
    }]
}
var $ClassName = new $ClassNameInternal();
export default $ClassName;
]
