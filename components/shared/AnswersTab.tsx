
import { getUserAnswer } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import React from "react";
import AnswerCard from "../cards/AnswerCard";
import Pagination from "./Pagination";


interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswersTab = async ({ searchParams, userId, clerkId, }: Props) => {

    const result =await getUserAnswer({
        userId,page:1,
        page: searchParams.page ? +searchParams : 1,
    })
    console.log(result.answers)
  return (
   <>
   {result.answers.map((item)=>(
    <AnswerCard
    key={item._id}
    clerkId={clerkId}
    _id={item._id}
    question={item.question}
    author={item.author}
    upvotes={item.upvotes.length}
    createdAt={item.createdAt}
    
    />
   ))}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNextAnswer}
        />
      </div>


     
   </>
  )
}

export default AnswersTab