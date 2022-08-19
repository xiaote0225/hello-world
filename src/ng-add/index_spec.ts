import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

const collectionPath = path.join(__dirname, '../collection.json');

describe('hello-world', () => {

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

  // const defalutOptions: HelloWorldSchema = { 
  //   name: 'Leo Chen' 
  // };

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

  it('成功在預設專案路徑底下新增Font-awesome',async () => {

    const tree = await runner.runSchematicAsync('ng-add', {}, appTree).toPromise();
    const moduleContent = tree.readContent('/projects/hello/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*FontAwesomeModule.*from '@fortawesome\/angular-fontawesome'/);
    expect(moduleContent).toMatch(/imports:\s*\[[^\]]+?,\r?\n\s+FontAwesomeModule\r?\n/m);

      // 驗證 Component 的內容
      const componentContent = tree.readContent('/projects/hello/src/app/app.component.ts');
      expect(componentContent).toMatch(/import.*faCoffee.*from '@fortawesome\/free-solid-svg-icons'/);
      expect(componentContent).toContain('faCoffee = faCoffee;');

      // 驗證 HTML 的內容
      const htmlContent = tree.readContent('/projects/hello/src/app/app.component.html');
      expect(htmlContent).toContain('<fa-icon [icon]="faCoffee"></fa-icon>');

      // 驗證 package.json 的內容
      const packageJson = JSON.parse(tree.readContent('/package.json'));
      const dependencies = packageJson.dependencies;
      expect(dependencies['@fortawesome/fontawesome-svg-core']).toBeDefined();
      expect(dependencies['@fortawesome/free-solid-svg-icons']).toBeDefined();
      expect(dependencies['@fortawesome/angular-fontawesome']).toBeDefined();

      // 驗證是否有執行安裝 package 的 task
      expect(runner.tasks.some(task => task.name === 'node-package')).toBe(true);

  });

  it('成功在 "world" 專案路徑底下新增 Font-awesome', async () => {
    appTree = await runner.runExternalSchematicAsync(
      '@schematics/angular',
      'application',
      { ...appOptions, name: 'world' },
      appTree
    ).toPromise();
    const options: NgAddSchema = { project: 'world' };
    const tree = await runner.runSchematicAsync('ng-add', options, appTree).toPromise();
    const moduleContent = tree.readContent('/projects/world/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*FontAwesomeModule.*from '@fortawesome\/angular-fontawesome'/);
    expect(moduleContent).toMatch(/imports:\s*\[[^\]]+?,\r?\n\s+FontAwesomeModule\r?\n/m);

    // 驗證 Component 的內容
    const componentContent = tree.readContent('/projects/world/src/app/app.component.ts');
    expect(componentContent).toMatch(/import.*faCoffee.*from '@fortawesome\/free-solid-svg-icons'/);
    expect(componentContent).toContain('faCoffee = faCoffee;');

    // 驗證 HTML 的內容
    const htmlContent = tree.readContent('/projects/world/src/app/app.component.html');
    expect(htmlContent).toContain('<fa-icon [icon]="faCoffee"></fa-icon>');

    // 驗證 package.json 的內容
    const packageJson = JSON.parse(tree.readContent('/package.json'));
    const dependencies = packageJson.dependencies;
    expect(dependencies['@fortawesome/fontawesome-svg-core']).toBeDefined();
    expect(dependencies['@fortawesome/free-solid-svg-icons']).toBeDefined();
    expect(dependencies['@fortawesome/angular-fontawesome']).toBeDefined();

    // 驗證是否有執行安裝 package 的 task
    expect(runner.tasks.some(task => task.name === 'node-package')).toBe(true);
  });

});
