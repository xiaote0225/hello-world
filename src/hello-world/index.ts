import { apply, mergeWith, Rule, SchematicContext, strings, template, Tree, url } from '@angular-devkit/schematics';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function helloWorld(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {

    const sourceTemplates = url('./files');

    const sourceParametrizedTemplates = apply(sourceTemplates,[
      template({
        ..._options,
        ...strings, //将这些函式加到规则里，范本语法才能正常运作
        addExclamation
      })
    ]);

    return mergeWith(sourceParametrizedTemplates);
  };
}

function addExclamation(_value:string):string{
  return _value = '!';
}