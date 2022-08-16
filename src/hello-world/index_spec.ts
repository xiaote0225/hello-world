import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('hello-world', () => {

  const expectResult = async (fileName?:string) => {
    const fullFileName = `/${fileName || 'hello'}`;
    const params = fileName ? {name: fileName} : {};
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner
    .runSchematicAsync('hello-world', params, Tree.empty())
    .toPromise();
    expect(tree.files).toContain(fullFileName);
    expect(tree.readContent(fullFileName)).toEqual('world');
  } 

  it('使用者没给档案名，则档案名为\'hello\'', async () => {
    expectResult();
  });
  it('使用者有给档案名，则档案名为使用者的档案名', async () => {
    expectResult('Leo');
  });
});
