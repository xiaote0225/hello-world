import { apply, mergeWith, move, Rule, SchematicContext, SchematicsException, strings, template, Tree, url } from '@angular-devkit/schematics';
// 需要先在終端機中輸入 'npm install @schematics/angular -S'
// import { parseName } from '@schematics/angular/utility/parse-name';
// import { buildDefaultPath } from '@schematics/angular/utility/workspace';

import * as ts from 'typescript';

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


    //将app.module.ts的程式码读取出来
    const text = _tree.read(`/projects/${projectName}/src/app/app.module.ts`) || [];
    const sourceFile = ts.createSourceFile(
      'test.ts',
      text.toString(), // 转成字串后丢进去以产生档案，方便后续操作
      ts.ScriptTarget.Latest,
      true
    );
    //先从SourceFile往下找到ClassDeclaration
    const classDeclaration = sourceFile.statements.find(node => ts.isClassDeclaration(node))! as ts.ClassDeclaration;
    //再往下找到Decorator
    const decorator = classDeclaration.decorators![0] as ts.Decorator;
    //再往下找到CallExpression
    const callExpression = decorator.expression as ts.CallExpression;
    //再往下找到ObjectLiteralExpression
    const objectLiteralExpression = callExpression.arguments[0] as ts.ObjectLiteralExpression;
    //再往下找到Identifier为declarations的PropertyAssignment
    const propertyAssignment = objectLiteralExpression.properties.find((property:ts.PropertyAssignment) => {
      return (property.name as ts.Identifier).text === 'declarations'
    })! as  ts.PropertyAssignment;
    //再往下找到ArrayLiteralExpression
    const arrayLiteralExpression = propertyAssignment.initializer as ts.ArrayLiteralExpression;
    //打印出ArrayLiteralExpression的内容
    // console.log(arrayLiteralExpression.getText());
    //先把原本在'ArrayLiteralExpression'的Identifier抓出来,后面需要用到
    const identifier = arrayLiteralExpression.elements[0] as ts.Identifier;
    //跟Tree说要更新哪个档案
    const declarationRecorder = _tree.beginUpdate(`/projects/${projectName}/src/app/app.module.ts`);

    //用Identifier从SourceFile找出较完整的字符串内容
    const changeText = identifier.getFullText(sourceFile);

    let toInsert = '';

    //如果原本的字符串内容有换行符号
    if(changeText.match(/^\r?\r?\n/)){
      //就把换行字符串前的空白加到字符串里面
      toInsert = `,${changeText.match(/^\r?\n\s*/)![0]}HelloLeoChenComponent`;
    }else{
      toInsert = `, HelloLeoChenComponent`;
    }

    //在原本的Identifier结尾的地方加上',HelloLeoChenComponent'的字
    declarationRecorder.insertLeft(identifier.end,toInsert);

    // 先抓到所有的ImportDeclaration
    const allImports = sourceFile.statements.filter(node => ts.isImportDeclaration(node))! as ts.ImportDeclaration[];

    //找到最后一个ImportDeclaration
    let lastImport: ts.Node | undefined;
    for(const importNode of allImports){
      if(!lastImport || importNode.getStart() > lastImport.getStart()){
        lastImport = importNode;
      }
    }
    //准备好要插入的程式代码
    const importStr = `\nimport { HelloLeoChenComponent } from './feature/hello-leo-chen.component.ts';`;

    //在最后一个ImportDeclaration结束的位置插入程式码
    declarationRecorder.insertLeft(lastImport!.end,importStr);

    //把变更记录提交给Tree,Tree会自动帮我们变更
    _tree.commitUpdate(declarationRecorder);
    //重新读取档案并打印出来看看
    console.log(_tree.read(`/projects/${projectName}/src/app/app.module.ts`)!.toString());


    return mergeWith(sourceParametrizedTemplates);
  };
}