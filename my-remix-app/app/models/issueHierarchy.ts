type DataItem = {
    id: number;
    level: number;
    title: string;
    parent_id: number | null;
};

type IssueNode = {
    id: number;
    title: string;
    parent: IssueNode | null;
    childrenArray: IssueNode[];
    addChild(childNode: IssueNode): void;
    getDepth(): number;
    removeNode(node: IssueNode): void;
    moveDown(roots: IssueNode[]): void;
    moveUp(): void;
    getChildrenIds(): number[];
};

// IssueNodeオブジェクトを作成する関数
const createNode = (id: number, nodeName: string): IssueNode => {
    return {
        id: id,
        title: nodeName,
        parent: null,
        childrenArray: [],
        addChild(childNode: IssueNode) {
            this.childrenArray.push(childNode);
            childNode.parent = this;
        },
        getDepth() {
            if (this.parent === null) return 0;
            return this.parent.getDepth() + 1;
        },
        removeNode(node: IssueNode) {
            const index = this.childrenArray.indexOf(node);
            if (index !== -1) {
                this.childrenArray.splice(index, 1);
                node.childrenArray.forEach(child => {
                    child.parent = this;
                    this.childrenArray.push(child);
                });
                node.childrenArray = [];
                node.parent = null;
            }
        },
        moveDown(roots: IssueNode[]) {
            // なぜrootsが必要なのか、rootsはそもそもどのようなデータか
            if (!this.parent) {
                // ルートノードの場合
                const index = roots.indexOf(this);

                // 直前のルートノードがある場合、その子要素に移動
                if (index > 0) {
                    const previousRoot = roots[index - 1];
                    previousRoot.addChild(this);
                    roots.splice(index, 1); // roots配列からこのノードを削除
                } else {
                    console.log(`No previous root node available to move ${this.title} down.`);
                }
            } else {
                // 親がいる場合、通常の動作
                const parentChildren = this.parent.childrenArray;
                const index = parentChildren.indexOf(this);

                if (index > 0) {
                    const previousSibling = parentChildren[index - 1];
                    previousSibling.addChild(this);
                    parentChildren.splice(index, 1);
                }
            }
        },
        moveUp() {
            if (!this.parent) return;

            const grandParent = !this.parent.parent ? null : this.parent.parent;
            const parentChildren = this.parent.childrenArray;
            const index = parentChildren.indexOf(this);

            console.log("moveUp grandParent:", grandParent)

            // 祖先要素がrootの場合に祖先のparentがない

            if (index !== -1) {
                if (grandParent !== null) {
                    // 祖先要素がある場合は祖先の子要素に追加
                    grandParent.addChild(this);
                    // 親要素に祖先要素をセット
                    this.parent = grandParent;
                } else {
                    // 親しかないときはrootなのでnullをセット
                    this.parent = null
                }
                parentChildren.splice(index, 1); // 親の子要素から削除
            }
        },
        getChildrenIds() {
            let childrenIds: number[] = [];
            for (const child of this.childrenArray) {
                childrenIds.push(child.id);
                childrenIds = childrenIds.concat(child.getChildrenIds());
            }
            return childrenIds;
        }
    };
};

// データから階層構造を構築する関数（複数のルートに対応）
export function createHierarchy(data: DataItem[]): { roots: IssueNode[]; nodes: { [key: number]: IssueNode } } {
    const nodes: { [key: number]: IssueNode } = {}; // 各ノードの参照を保持
    const roots: IssueNode[] = []; // ルートノードを保持する配列

    // 各データアイテムをノードに変換して辞書に格納
    data.forEach(item => {
        nodes[item.id] = createNode(item.id, item.title);
    });

    // 親子関係の設定
    data.forEach(item => {
        const node = nodes[item.id];
        if (item.parent_id === null) {
            roots.push(node); // 親がない場合はルートノードとして追加
        } else {
            const parent = nodes[item.parent_id];
            if (parent) {
                parent.addChild(node); // 親ノードがある場合はその親に追加
            }
        }
    });

    return { roots, nodes };
}

// 特定のIDのノードを取得してメソッドを実行する関数
export function executeMethodById(id: number, nodes: { [key: number]: IssueNode }, method: (node: IssueNode) => void) {
    const node = nodes[id];
    if (node) {
        method(node);
    } else {
        console.log(`Node with id ${id} not found`);
    }
}

// ツリー全体の情報を配列として返す関数（複数のルート対応）
export function Expand(nodes: IssueNode[]): { id: number; title: string; depth: number }[] {
    const result: { id: number; title: string; depth: number }[] = [];

    function traverse(node: IssueNode) {
        result.push({ id: node.id, title: node.title, depth: node.getDepth() });
        for (const child of node.childrenArray) {
            traverse(child);
        }
    }

    // すべてのルートノードに対して展開を実行
    nodes.forEach(root => traverse(root));
    return result;
}
