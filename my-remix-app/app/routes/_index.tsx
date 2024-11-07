import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
// import { redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, json } from "@remix-run/react";
import { useState } from 'react';
import { ERROR_MSG } from '../constants';

export const meta: MetaFunction = () => {
  return [
    { title: "イシューリスト" },
    { name: "description", content: "課題一覧を作成" },
  ];
};

type Issue = { 
  title: string,
  id?: number 
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
    if (title === ""){
      return json({ errors: { title: ERROR_MSG.ERROR_EMPTY_ISSUE } }, { status: 422 });
    }
  
    await fetch("http://localhost:8000/issue", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: title })
    });
  }

  if (form.get('type') === "deleteIssue") {
    const id = form.get('id');
    if (id === ""){
      return json({ errors: { title: ERROR_MSG.ERROR_EMPTY_ISSUE } }, { status: 422 });
    }

    const res = await fetch("http://localhost:8000/issue?issue_id=" + id, {
      method: "DELETE"
    });

    console.log("---- delete ----", res)
  }

  return await fetch("http://localhost:8000/issue");
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
  // todo:再レンダリングが無駄に走っているので減らす or 範囲を狭める
  // todo:登録ボタン押したら入力内容をクリアする
  // todo:レンダリングを何度も繰り返す形をReactが採用しているのは何故？どういうメリットがある？

  const [issueText, setIssueText] = useState("" as string);

  const fetcher = useFetcher();
  const loader:Issue[] = useLoaderData<typeof loader>();
  const issues = fetcher.data as Issue[] ?? loader;
  console.log("---- index ----", issues)

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <fetcher.Form method="post">
          <input name="type" type="hidden" value="addIssue"/>
          <input name="title" type="text" value={issueText} onChange={event => setIssueText(event.target.value)} />
          <button type="submit" /*onClick={addIssue}*/>登録</button>
        </fetcher.Form>
        <div>
        {issues.map((issue:Issue, index:number) => (
          <div
            key={index}
            className="flex items-center border-b border-gray-300 py-2"
          >
            <div className="flex-grow">{issue.title}</div>
            <div>
              <fetcher.Form method="delete">
                <input name="type" type="hidden" value="deleteIssue"/>
                <input name="id" type="hidden" value={issue.id} />
                <button type="submit">削除</button>
              </fetcher.Form>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
