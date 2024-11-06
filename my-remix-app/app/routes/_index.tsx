import type { MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
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
  return [{
    id:1,
    title:"筋トレ"
  },{
    id:2,
    title:"寝る"
  }]
};

export default function Index() {
  const [issues, setIssue] = useState(useLoaderData() as Issue[]);
  const [issueText, setIssueText] = useState("" as string);
  const [warningMsg, setWarningMsg] = useState("" as string);

  /**
   * イシュー追加
   */
  function addIssue() {
    let msg:string = "";
    try {
      if (issueText === ""){
        throw new Error(ERROR_MSG.ERROR_EMPTY_ISSUE);
      }

      if (typeof existTitle(issues) !== "undefined"){
        throw new Error(ERROR_MSG.ERROR_DUPLICATE_ISSUE);
      }

      issues.push({title : issueText});
      const newIssues = [...issues];
      setIssue(newIssues);
    } catch (e: unknown) {
      if (e instanceof Error) {
        msg = e.message;
      }
    }

    setWarningMsg(msg);
  }

  /**
   * イシューの重複チェック
   * @returns undefined | Issue
   */
  function existTitle(issues:Issue[]): undefined | Issue {
    return issues.find(({ title })=>{console.log(title, issueText); return title === issueText})
  }

  /**
   * イシュー削除
   */
  function deleteIssue() {
    issues.push({title : issueText});
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <Form method="post">
          <input name="issue" type="text" value={issueText} onChange={event => setIssueText(event.target.value)} />
          <button type="button" onClick={addIssue}>登録</button>
        </Form>
        <div>{warningMsg}</div>
        <div>
        {issues.map((issue, index) => (
          <div
            key={index}
            className="flex items-center border-b border-gray-300 py-2"
          >
            <div className="flex-grow">{issue.title}</div>
            <div>
              <button onClick={deleteIssue}>削除</button>
          </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
