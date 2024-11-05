import type { MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from 'react';

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

  /**
   * イシュー追加
   */
  function addIssue() {
    if (issueText!==""){
      issues.push({title : issueText});
      const newIssues = [...issues];
      setIssue(newIssues);
    }
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
