import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
// import { redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, json } from "@remix-run/react";
import { ERROR_MSG } from '../constants';
import { createHierarchy, executeMethodById, Expand } from "../models/issueHierarchy";

export const meta: MetaFunction = () => {
  return [
    { title: "イシューリスト" },
    { name: "description", content: "課題一覧を作成" },
  ];
};

type Issue = {
  id: number,
  title: string,
  level: number,
  parent_id: number | null
}

export const loader = async () => {
  return await fetch("http://localhost:8000/issue");
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // todo:バリデーション実装
  // todo:イシューの重複チェックしたい
  // todo:最後に全件取得する処理なくしたいがなるべく処理をシンプルに保つためにもこの構造でよいか？
  // todo:actionがごちゃごちゃしているので構造化したい（repostioryパターン使う？？）
  const form = await request.formData();
  console.log("---- action ----", form)

  if (form.get('type') === "addIssue") {
    const title = form.get('title');
    const level = form.get('level');
    if (title === ""){
      throw new Error(ERROR_MSG.ERROR_EMPTY_ISSUE);
    }
  
    await fetch("http://localhost:8000/issue", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: title, level: level })
    });
  }

  const response = await fetch("http://localhost:8000/issue")
  if (!response.ok) {
    throw new Error('response error');
  }
  const issues: Issue[] = await response.json();
  // 階層構造の構築
  const { roots, nodes } = createHierarchy(issues);

  if (form.get('type') === "left") {
    const id = form.get('id') !== null ? Number(form.get('id')) : null;
    if (id === null) {
      throw new Error('id取得失敗');
    }
    // todo:2段下にいるとき1段飛ばしてrootまでいってしまう
    executeMethodById(id, nodes, node => node.moveUp());
    await fetch("http://localhost:8000/issue/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: nodes[id].title, 
        level: nodes[id].getDepth(), 
        parent_id: nodes[id].parent !== null ? nodes[id].parent.id : null
      })
    });

    console.log("--- left ---", nodes)
  }

  if (form.get('type') === "right") {
    const id = form.get('id') !== null ? Number(form.get('id')) : null;
    if (id === null) {
      throw new Error('id取得失敗');
    }
    executeMethodById(id, nodes, node => node.moveDown(roots));
    await fetch("http://localhost:8000/issue/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: nodes[id].title, 
        level: nodes[id].getDepth(), 
        parent_id: nodes[id].parent !== null ? nodes[id].parent.id : null
      })
    });
    console.log("--- right ---", nodes)
  }

  if (form.get('type') === "deleteIssue") {
    const id = form.get('id') !== null ? Number(form.get('id')) : null;
    if (id === null) {
      throw new Error('id取得失敗');
    }
    // 子要素のID取得
    const node = nodes[id]
    let childrenIds:number[] = [];
    if (node) {
      childrenIds = node.getChildrenIds();
    }

    // 削除
    executeMethodById(id, nodes, node => {
      if (node.parent) { // 削除時親が存在していれば
          node.parent.removeNode(node); // 親が持つ子要素リストから自身を削除、自身の子要素を親にセット
      }
      // 自身を削除
      delete nodes[id];
    });

    // todo:delete時自身を削除+子要素の位置を変える為の更新処理のトランザクションを張りたいのでリクエストを複数に分けずまとめる
    const res = await fetch("http://localhost:8000/issue?issue_id=" + id, {
      method: "DELETE"
    });

    // 子が削除した親と同じ階層に上がるので階層(level)・親(parent_id)の更新
    console.log("小要素リスト:", childrenIds)
    if (childrenIds.length > 0) {
      // 子要素の階層(level)・親(parent_id)の更新
      for (const id of childrenIds) {
        const res = await fetch("http://localhost:8000/issue/" + id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title: nodes[id].title, level: nodes[id].getDepth(), parent_id: nodes[id].parent !== null ? nodes[id].parent.id : null })
        });

        console.log("小要素の更新:", res)
      }
    }
    console.log("---- delete ----", res)
  }

  const results:Issue[] = []
  const keys: number[] = Object.keys(nodes).map(key => Number(key));
  keys.forEach((key) => {
      results.push({
          id: nodes[key].id,
          level: nodes[key].getDepth(),
          title: nodes[key].title,
          parent_id: nodes[key].parent !== null ? nodes[key].parent.id : null
      })
  })

  console.log("変更後：", results)

  return results
};


/**
 * イシューの重複チェック
 * @returns undefined | Issue
 */
/*
function existTitle(issues:Issue[]): undefined | Issue {
  return issues.find(({ title })=>{return title === issueText})
}
*/

export default function Index() {
  // todo:登録ボタン押したら入力内容をクリアする
  // todo:レンダリングを何度も繰り返す形をReactが採用しているのは何故？どういうメリットがある？
  // todo:JSの最期に「;」は一文で複数文描く時以外は不要？

  const fetcher = useFetcher()
  const loader:Issue[] = useLoaderData<typeof loader>()
  const issues:Issue[] = fetcher.data as Issue[] ?? loader
  console.log("---- index ----", issues)

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <fetcher.Form method="post">
          <input name="type" type="hidden" value="addIssue"/>
          <input name="level" type="hidden" value="1"/>
          <input name="title" type="text" />
          <button type="submit">登録</button>
        </fetcher.Form>
        <div id="issues">
          {
            issues.map((issue:Issue, index:number) => (
              <div
                key={index}
                className={"flex border-b border-gray-300 py-2"}
                style={{ width: "200px", position: "relative", left: `${issue.level * 30}px` }}
              >
                <div className="flex-grow">{issue.title}</div>
                <div className="issue">
                  <fetcher.Form method="post">
                    <input name="type" type="hidden" value="left"/>
                    <input name="id" type="hidden" value={issue.id} />
                    <button type="submit">←</button>
                  </fetcher.Form>
                </div>
                <div style={{ marginLeft: "15px" }}>
                  <fetcher.Form method="post">
                    <input name="type" type="hidden" value="right"/>
                    <input name="id" type="hidden" value={issue.id} />
                    <button type="submit">→</button>
                  </fetcher.Form>
                </div>
                <div style={{ marginLeft: "30px" }}>
                  <fetcher.Form method="delete">
                    <input name="type" type="hidden" value="deleteIssue"/>
                    <input name="id" type="hidden" value={issue.id} />
                    <button type="submit">削除</button>
                  </fetcher.Form>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
