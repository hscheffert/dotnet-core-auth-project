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

    string ClassNameWithExtends(Class c) {
        return c.Name + c.TypeParameters + (c.BaseClass != null ? " extends " + c.BaseClass.Name : "");
    }

    string InterfaceNameWithType(Class c) {
        return c.Name + (c.TypeParameters.Any() ? "<any>" : c.TypeParameters.ToString());
    }

    string InterfaceNameWithExtends(Class c) {
        return c.Name + c.TypeParameters + (c.BaseClass != null ?  " extends " + c.BaseClass.Name : "");
    }

    string GetBaseCreate(Class c) {
        return c.BaseClass != null ?  c.BaseClass.Name + ".create()," : "";
    }

    string DefaultValue(Property p)
    {
        if (IsPropertyRequired(p))
        {
            if (p.Type.Name == "string")
            {
                return "''";
            }
        }
        else if (p.Type.IsEnum)
        {
           return p.Type.Constants.Min(f=>f.Value);
        }

        if (!p.Type.IsNullable && p.Type.Name == "Date")
        {
            return "new Date(0).toISOString()";
        }

        return p.Type.Default();
    }

    bool IsPropertyRequired(Property p) 
    {
        foreach (var attribute in p.Attributes)
        {
            if (attribute.Name == "Required")
            {
                return true;
            }
        }
        return false;
    }

    string PropertyType(Property p)
    {
        bool canBeNull = !p.Type.IsPrimitive || p.Type.IsNullable || (p.Type.Name == "string" && !IsPropertyRequired(p));
        string type =  p.Type.ToString();
        if(type == "Date"){
            type = "moment.Moment | string";
        }
        return type + (canBeNull ? " | null" : "");
    }

    string PropertyGenerator(Property p)
    {
        var className = p.Type.Name;
        var nullable = p.Type.IsNullable ? "?" : "";

        // Sanity check
        if (className.Length < 1)
        {
            return "";
        }

        // Dates are weird so just return a whole import here
        if (p.Type.IsDate)
        {
            className = "Moment";
        }
        if (p.Type.TypeArguments.Any(x => x.IsDate))
        {
            className = "Moment[]";
        }
        
        // Run other replacements such as Tuple
        if (className.StartsWith("Tuple"))
        {
            // Hacky but it works!
            className = $"Tuple{p.Type.TypeParameters.Count}<{className.Split('<')[1]}";
        }

        return $"{p.name + nullable}: {className}";
    }

    // Our job is to remove the "<>"s and format a proper import statement
    string ImportGenerator(Type t)
    {
        var className = t.Name;

        // Check for generic, which indicates DTO<T> or similar
        if (GenericTypeList.Any(x => x.Name == t.Name))
        {
            return "";
        }

        // Remove <>'s and []'s from generics and arrays
        className = className.Split('<')[0];
        className = className.Split('[')[0];

        // Dates are weird so just return a whole import here
        if (t.IsDate || t.TypeArguments.Any(x => x.IsDate))
        {
            return "";
        }
        
        // Run other replacements such as Tuple
        if (className == "Tuple")
        {
            // Name here comes out to Tuple1 or similar
            var tupleName = $"{{ Tuple{t.TypeParameters.Count} }}";
            return $"import {tupleName} from '../frontend/common/KeyValueAndSimilar';";
        }

        return $"import {className} from './{className}';";
    }

    string Imports(Class c)
    {
        Log("Running Import");
        try 
        {
            var propImports = c.Properties
                .Where(x => !x.Type.IsPrimitive || x.Type.IsDate || (x.Type.TypeArguments.Any(x => x.IsDate))) // Remove Primitives but keep dates
                .SelectMany(m => m.Type.TypeArguments.Where(x => !x.IsPrimitive).Append(m.Type)) // Take props and generic type arguments and mash them into a single list
                .Append(c.BaseClass) // Add baseclase for those that need it
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
}$Classes(x => !x.IsAbstract && x.Name.EndsWith("DTO") || x.Name.EndsWith("Model")|| x.Name.EndsWith("ApiError"))[$Initialize
/** File has been generated by TypeWriter. Modifications will be overriden when the template is rendered */
// @ts-ignore
import * as moment from 'moment';
import InterfaceConstructor from '../InterfaceConstructor';
$Imports
interface $InterfaceNameWithExtends { $Properties[
    $name: $PropertyType;]
}
const $Name: InterfaceConstructor<$InterfaceNameWithType> = {
    create: (initValues?: {} | null | undefined) => {
        return Object.assign($GetBaseCreate
        {$Properties[
            $name: $DefaultValue,]
        },
        initValues);
    }
};

export default $Name;]
