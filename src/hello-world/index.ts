import { apply, mergeWith, move, Rule, SchematicContext, SchematicsException, strings, template, Tree, url } from '@angular-devkit/schematics';
// 需要先在終端機中輸入 'npm install @schematics/angular -S'
// import { parseName } from '@schematics/angular/utility/parse-name';
// import { buildDefaultPath } from '@schematics/angular/utility/workspace';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function helloWorld(_options: HelloWorldSchema): Rule {
  return async(_tree: Tree, _context: SchematicContext) => {

    //读取angular.json,如果没有这个档案表示该专案不是Angular专案
    const workspaceConfigBuffer = _tree.read('angular.json');
    if(!workspaceConfigBuffer){
      throw new SchematicsException('Not an Angular CLI workspace');
    }

    //解析出专案的正确路径与档名
    const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
    const projectName = _options.project || workspaceConfig.defaultProject || 'hello';
    // console.log('projectName....',projectName);
    const project = workspaceConfig.projects[projectName]
    // console.log('project....',project);
    // const defaultProjectPath = buildDefaultPath(project);
    // console.log('defaultProjectPath....',defaultProjectPath);
    // const parsePath = parseName(defaultProjectPath,_options.name);
    // const {name,path} = parsePath;

    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates,[
      template({
        ..._options,
        ...strings, //将这些函式加到规则里，范本语法才能正常运作
      }),
      move(project.sourceRoot+'/app')
    ]);

    return mergeWith(sourceParametrizedTemplates);
  };
}