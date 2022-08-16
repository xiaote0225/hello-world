import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function helloWorld(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    //产生一个档案抿成为使用者所输入的 --name 参数的值，没输入则为'hello'的档案
    //档案内容为'world'
    tree.create(_options.name || 'hello','world');

    return tree;
  };
}
