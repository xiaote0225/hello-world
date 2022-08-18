import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { HelloWorldSchema } from './schema';

const collectionPath = path.join(__dirname, '../collection.json');

describe('hello-world', () => {

  // const expectResult = async (fileName?:string) => {
  //   const fullFileName = `/${fileName || 'hello'}`;
  //   const params = fileName ? {name: fileName} : {};
  //   const runner = new SchematicTestRunner('schematics', collectionPath);
  //   const tree = await runner
  //   .runSchematicAsync('hello-world', params, Tree.empty())
  //   .toPromise();
  //   expect(tree.files).toContain(fullFileName);
  //   expect(tree.readContent(fullFileName)).toEqual('world');
  // } 

  // it('使用者没给档案名，则档案名为\'hello\'', async () => {
  //   expectResult();
  // });
  // it('使用者有给档案名，则档案名为使用者的档案名', async () => {
  //   expectResult('Leo');
  // });
  // it('成功产出档案，档案名为"/hello-leo-chen.component.ts"',async () => {
  //   const name = 'LeoChen';
  //   const runner = new SchematicTestRunner('schematics',collectionPath);
  //   const tree = await runner
  //   .runSchematicAsync('hello-world', {name:name}, Tree.empty())
  //   .toPromise();
  //   const dasherizeName = strings.dasherize(name);
  //   const fullFileName = `/hello-${dasherizeName}.component.ts`;
  //   expect(tree.files).toContain(fullFileName);
  //   const fileContent = tree.readContent(fullFileName);
  //   expect(fileContent).toMatch(/hello-leo-chen/);
  //   expect(fileContent).toMatch(/HelloLeoChenComponent/);
  // });

  const runner = new SchematicTestRunner('schematics', collectionPath);

  const workspaceOptions:WorkspaceOptions = {
    name:'workspace', //不重要的名字，随便取，不影响测试结果
    newProjectRoot:'projects', //转案里，所有App的跟目录，可以随便取，验证时会用到
    version:'6.0.0', //不重要的版本号，随便取，不影响测试结果
  };

  const appOptions:ApplicationOptions= {
    name:'hello', //专案名称
    inlineStyle:false, //true or false 都可以，不影响测试结果
    inlineTemplate:false,//ture or false 都可以，不影响测试结果
    routing: false, //true or false 都可以，不影响测试结果
    style: Style.Css, // Csss / Less / Sass / scss / style都可以,不影响测试结果
    skipTests:false, // true or false 都可以, 不影响测试结果
    skipPackageJson: false, // true or false 都可以，不影响测试结果
  }

  const defalutOptions: HelloWorldSchema = { 
    name: 'Leo Chen' 
  };

  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await runner.runExternalSchematicAsync(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    ).toPromise();
    appTree = await runner.runExternalSchematicAsync(
      '@schematics/angular',
      'application',
      appOptions,
      appTree
    ).toPromise();
  });

  it('成功产出档案，则档案名为/hello-leo-chen.component.ts，並將其加到 AppModule 的 declarations 裡',async () => {
    const options:HelloWorldSchema = { ...defalutOptions };

    appTree = await runner.runSchematicAsync('hello-world',options,appTree).toPromise();
    
    expect(appTree.files).toContain('/projects/hello/src/app/hello-leo-chen.component.ts');

    //读取档案
    const moduleContent = appTree.readContent('/projects/hello/src/app/app.module.ts');
    //验证是否有正确的import进去
    expect(moduleContent).toMatch(/import.*HelloLeoChen.*from '.\/hello-leo-chen.component'/);
    //验证是否有正确加进declarations里
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+HelloLeoChenComponent\r?\n/m);
  });

  it('成功在 "world" 專案路徑底下產出檔案，並將其加到 AppModule 的 declarations 裡', async () => {
    appTree = await runner.runExternalSchematicAsync(
      '@schematics/angular',
      'application',
      { ...appOptions, name: 'world' },
      appTree
    ).toPromise();
    const options = { ...defalutOptions, project: 'world' };
    appTree = await runner.runSchematicAsync('hello-world', options, appTree).toPromise();
    expect(appTree.files).toContain('/projects/world/src/app/hello-leo-chen.component.ts');

    const moduleContent = appTree.readContent('/projects/world/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*HelloLeoChen.*from '.\/hello-leo-chen.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+HelloLeoChenComponent\r?\n/m);
  });

});
