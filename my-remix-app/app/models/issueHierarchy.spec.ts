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