"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { sidebarLinks } from "@/constants";
import { SignedOut, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";


const LeftSidebar = () => {
  const {userId} =useAuth()
  const pathname = usePathname();
  return (
    <section className="background-light900_dark200 light-border  custom-scrollbar sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px] ">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((links) => {
          const isActive =
            (pathname.includes(links.route) && links.route.length > 1) ||
            pathname === links.route;

            // Profile page

            if(links.route ==="/profile"){
              if(userId){
                links.route =`${links.route}/${userId}`
              } else {
                 return null
              }
            }

          return (
            <Link
              key={links.route}
              href={links.route}
              className={`${
                isActive
                  ? "primary-gradient text-light-900"
                  : "text-dark300_light900"
              } flex items-center justify-start gap-4 rounded-lg bg-transparent p-4`}
            >
              <Image
                src={links.imgURL}
                alt={links.label}
                width={20}
                height={20}
                className={`${isActive ? "" : "invert-colors"}`}
              />
              <p className={`${isActive ? "base-bold" : "base-medium"} max-lg:hidden`}>
                {links.label}
              </p>
            </Link>
          );
        })}
      </div>
      <SignedOut>
        <div className="flex flex-col gap-3">
          <Link href="/sign-in">
            <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                <Image src="/assets/icons/account.svg"
                alt="login" width={20} height={20} className="invert-colors lg:hidden"/>
              <span className="primary-text-gradient max-lg:hidden"> Log In</span>
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none">
            <Image src="/assets/icons/sign-up.svg"
                alt="Sign Up" width={20} height={20} className="invert-colors lg:hidden"/>
              <span className="max-lg:hidden"> SignUp</span>
           
            </Button>
          </Link>
        </div>
      </SignedOut>
    </section>
  );
};

export default LeftSidebar;
