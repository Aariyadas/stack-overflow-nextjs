"use client";

import React, { useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,

  FormMessage,
} from "../ui/form";
import { AnswerSchema } from "@/lib/valdations";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "../ui/button";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { usePathname } from "next/navigation";
interface Props {
    question:string,
    questionId:string,
    authorId:string,
}
const Answer = ({question,questionId,authorId}:Props) => {
    const pathname=usePathname()
   const [isSubmitting,setIssubmitting]=useState(false)
   const [isSubmittingAI,setIssubmittingAI]=useState(false)
    const {mode}=useTheme()
    const editorRef=useRef(null)
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: "",
    },
  });
 
  const handleCreateAnswer =async (values:z.infer<typeof AnswerSchema>) => {
    setIssubmitting(true);
    try{
        console.log("Answer")
        await createAnswer({
         content:values.answer,
         author:JSON.parse(authorId),
         question:JSON.parse(questionId),
         path:pathname

        })
        form.reset();
        if(editorRef.current){
            const editor=editorRef.current as any;
            editor.setContent('');

        }

    }catch(error){
        console.log(error)
        throw error;

    }finally{
        setIssubmitting(false)
    }
  };
  const generateAIAnswer =async ()=>{
    if(!authorId)
    return ;
  setIssubmittingAI(true)

  try {
    const response =await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chatgpt`,{
    method:"POST",
    body:JSON.stringify({question})
    })

    const aiAnswer=await response.json();
    console.log(aiAnswer)
    alert (aiAnswer.reply)
  }catch(error){
    console.log(error)

  }finally{
    setIssubmittingAI(false)
  }
  }
  return (
    <div>
        <div className=" flex flex-col  justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
            <h4 className="paragraph-semibold text-dark400_light800 ">Write your answer here.</h4>
            <Button className="btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500"
            onClick={generateAIAnswer}>
                <Image 
                src="/assets/icons/starss.svg"
                alt="star"
                width={12}
                height={12}
                className='object-contain'/>
                Generate AI Answer
            </Button>
        </div>
    <Form {...form}>
      <form
        className="mt-6 flex w-full flex-col gap-10"
        onSubmit={form.handleSubmit(handleCreateAnswer)}
      >
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              
              <FormControl className="mt-3.5">
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                  onInit={(evt, editor) => {
                    // @ts-ignore
                    editorRef.current = editor;
                  }}
                  // Keep track what we enter
                  onBlur={field.onBlur}
                  onEditorChange={(content) => field.onChange(content)}
                 
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "codesample",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                    ],
                    toolbar:
                      "undo redo | " +
                      "codesample | bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist ",
                    content_style: "body { font-family:Inter; font-size:16px }",
                    skin: mode==='dark'?'oxide-dark':'oxide',
                    content_css:mode==='dark' ?'dark':'light',
                  }}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500 ">
                Introduce the problem and expand on what you put in the title.
                Minimum 20 characters.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
            <Button 
            type="submit"
            className="primary-gradient w-fit text-white"
                disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting..':'Submit'}

            </Button>

        </div>
      </form>
    </Form>
    </div>
  );
};

export default Answer;
