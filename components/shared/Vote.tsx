"use client"
import { formatNumberWithExtension } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'
interface Props {
type:string;
itemId:string;
userId:string;
upvotes:number;
hasupVoted:boolean;
downvotes:number;
hasdownVoted:boolean;
hasSaved?:boolean;
}
const Vote = ({
  type,
  itemId,
  userId,
  upvotes,
  hasupVoted,
  downvotes,
  hasdownVoted,
  hasSaved,

}:Props) => {
 const handleVote =(action:string)=>{

 }
 const handleVote=()=>{

 }

  return (
    <div className='flex gap-5'>
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
          src={hasupVoted ? '/assets/icons/upvoted.svg' :'/assets/icons/upvote.svg'}
          width={18}
          height={18}
          alt="upvoted"
          className="cursor-pointer"
          onClick ={()=>handleVote('upvote')}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className='subtle-medium text-dark400_light900'>
              {formatNumberWithExtension(upvotes)}
            </p>

          </div>

        </div>
        <div className="flex-center gap-1.5">
          <Image
          src={hasdownVoted ? '/assets/icons/downvoted.svg' :'/assets/icons/downvote.svg'}
          width={18}
          height={18}
          alt="downvoted"
          className="cursor-pointer"
          onClick ={()=>handleVote('downVote')}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className='subtle-medium text-dark400_light900'>
              {formatNumberWithExtension(downvotes)}
            </p>

          </div>

        </div>

      </div>
      <div className="flex-center gap-1.5">
          <Image
          src={hasSaved ? '/assets/icons/star-filled' :'/assets/icons/star-red.svg'}
          width={18}
          height={18}
          alt="hasSaved"
          className="cursor-pointer"
          onClick ={handleSave}
          />
         

        </div>

    </div>
  )
}

export default Vote
