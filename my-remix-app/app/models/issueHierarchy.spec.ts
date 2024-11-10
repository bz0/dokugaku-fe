import { describe, expect, it } from "vitest";
import { createHierarchy, executeMethodById } from "./issueHierarchy";


type Issue = {
    id: number,
    title: string,
    level: number,
    parent_id: number | null
}

describe("moveUp", () => {
    const issues:Issue[] = [{
        id: 1,
        title: "root",
        level: 0,
        parent_id: null
    },{
        id: 2,
        title: "root",
        level: 0,
        parent_id: null
    },{
        id: 3,
        title: "parent-2",
        level: 1,
        parent_id: 2
    },{
        id: 4,
        title: "parent-3",
        level: 2,
        parent_id: 3
    }]

    it("子要素も一緒に上がっているか", () => {
        const check:Issue[] = [{
            id: 1,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 2,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 3,
            title: "parent-2",
            level: 0,
            parent_id: null
        },{
            id: 4,
            title: "parent-3",
            level: 1,
            parent_id: 3
        }]

        const { nodes } = createHierarchy(issues);
        executeMethodById(3, nodes, node => node.moveUp());

        const results:Issue[] = [];
        const keys: number[] = Object.keys(nodes).map(key => Number(key));
        keys.forEach((key) => {
            results.push({
                id: nodes[key].id,
                title: nodes[key].title,
                level: nodes[key].getDepth(),
                parent_id: nodes[key].parent !== null ? nodes[key].parent.id : null
            })
        })

        expect(results).toStrictEqual(check);
    });

    it("rootを上げてlevelが0のまま", () => {
        const check:Issue[] = [{
            id: 1,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 2,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 3,
            title: "parent-2",
            level: 1,
            parent_id: 2
        },{
            id: 4,
            title: "parent-3",
            level: 2,
            parent_id: 3
        }]

        const { nodes } = createHierarchy(issues);
        executeMethodById(2, nodes, node => node.moveUp());

        const results:Issue[] = [];
        const keys: number[] = Object.keys(nodes).map(key => Number(key));
        keys.forEach((key) => {
            results.push({
                id: nodes[key].id,
                title: nodes[key].title,
                level: nodes[key].getDepth(),
                parent_id: nodes[key].parent !== null ? nodes[key].parent.id : null
            })
        })

        expect(results).toStrictEqual(check);
    });
});

describe("moveDown", () => {
    const issues:Issue[] = [{
        id: 1,
        title: "root",
        level: 0,
        parent_id: null
    },{
        id: 2,
        title: "root",
        level: 0,
        parent_id: null
    },{
        id: 3,
        title: "parent-2",
        level: 1,
        parent_id: 2
    },{
        id: 4,
        title: "parent-3",
        level: 2,
        parent_id: 3
    }]

    it("子要素も一緒に下がっているか", () => {
        const check:Issue[] = [{
            id: 1,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 2,
            title: "root",
            level: 1,
            parent_id: 1
        },{
            id: 3,
            title: "parent-2",
            level: 2,
            parent_id: 2
        },{
            id: 4,
            title: "parent-3",
            level: 3,
            parent_id: 3
        }]

        const { roots, nodes } = createHierarchy(issues);
        const id = 2;
        executeMethodById(id, nodes, node => node.moveDown(roots));

        const results:Issue[] = [];
        const keys: number[] = Object.keys(nodes).map(key => Number(key));
        keys.forEach((key) => {
            results.push({
                id: nodes[key].id,
                title: nodes[key].title,
                level: nodes[key].getDepth(),
                parent_id: nodes[key].parent !== null ? nodes[key].parent.id : null
            })
        })

        expect(results).toStrictEqual(check);
    });

    it("親の子要素にmoveDownした場合階層は変わらないこと", () => {
        const check:Issue[] = [{
            id: 1,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 2,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 3,
            title: "parent-2",
            level: 1,
            parent_id: 2
        },{
            id: 4,
            title: "parent-3",
            level: 2,
            parent_id: 3
        }]

        const { nodes } = createHierarchy(issues);
        const id = 3;
        executeMethodById(id, nodes, node => node.moveUp());

        const results:Issue[] = [];
        const keys: number[] = Object.keys(nodes).map(key => Number(key));
        keys.forEach((key) => {
            results.push({
                id: nodes[key].id,
                title: nodes[key].title,
                level: nodes[key].getDepth(),
                parent_id: nodes[key].parent !== null ? nodes[key].parent.id : null
            })
        })

        expect(results).toStrictEqual(check);
    });
});

describe("delete", () => {
    const issues:Issue[] = [{
        id: 1,
        title: "root",
        level: 0,
        parent_id: null
    },{
        id: 2,
        title: "root",
        level: 0,
        parent_id: null
    },{
        id: 3,
        title: "parent-2",
        level: 1,
        parent_id: 2
    },{
        id: 4,
        title: "parent-3",
        level: 2,
        parent_id: 3
    }]

    it("rootの削除（子要素なし）の場合rootのみ削除されること", () => {
        const check:Issue[] = [{
            id: 2,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 3,
            title: "parent-2",
            level: 1,
            parent_id: 2
        },{
            id: 4,
            title: "parent-3",
            level: 2,
            parent_id: 3
        }]

        const { nodes } = createHierarchy(issues);
        const id:number = 1

        executeMethodById(id, nodes, node => {
            if (node.parent) { // 削除時親が存在していれば
                node.parent.removeNode(node); // 親が持つ子要素リストから自身を削除、自身の子要素を親にセット
            }
            // 自身を削除
            delete nodes[id];
        });

        const results:Issue[] = [];
        const keys: number[] = Object.keys(nodes).map(key => Number(key));
        keys.forEach((key) => {
            results.push({
                id: nodes[key].id,
                title: nodes[key].title,
                level: nodes[key].getDepth(),
                parent_id: nodes[key].parent !== null ? nodes[key].parent.id : null
            })
        })

        expect(results).toStrictEqual(check);
    })

    it("子要素ありの場合、削除要素の親に子要素が移動すること", () => {
        const issues:Issue[] = [{
            id: 1,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 2,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 3,
            title: "parent-2",
            level: 1,
            parent_id: 2
        },{
            id: 4,
            title: "parent-3",
            level: 2,
            parent_id: 3
        },{
            id: 5,
            title: "parent-4",
            level: 3,
            parent_id: 4
        }]

        const check:Issue[] = [{
            id: 1,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 2,
            title: "root",
            level: 0,
            parent_id: null
        },{
            id: 4,
            title: "parent-3",
            level: 1,
            parent_id: 2
        },{
            id: 5,
            title: "parent-4",
            level: 2,
            parent_id: 4
        }]

        const { nodes } = createHierarchy(issues);
        const id:number = 3

        executeMethodById(id, nodes, node => {
            if (node.parent) { // 削除時親が存在していれば
                node.parent.removeNode(node); // 親が持つ子要素リストから自身を削除、自身の子要素を親にセット
            }
            // 自身を削除
            delete nodes[id];
        });

        const results:Issue[] = [];
        const keys: number[] = Object.keys(nodes).map(key => Number(key));
        keys.forEach((key) => {
            results.push({
                id: nodes[key].id,
                title: nodes[key].title,
                level: nodes[key].getDepth(),
                parent_id: nodes[key].parent !== null ? nodes[key].parent.id : null
            })
        })

        expect(results).toStrictEqual(check);
    })
});