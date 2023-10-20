import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimeStamp = (createdAt: Date): string => {
  const currentDate = new Date();

  const timeDifference = currentDate.getTime() - createdAt.getTime(); // Use getTime() to get timestamps
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  } else {
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }
};


export const  formatNumberWithExtension=(number: number): string =>{
  if (Math.abs(number) >= 1000000) {
    return (number / 1000000).toFixed(2) + "M";
  } else if (Math.abs(number) >= 1000) {
    return (number / 1000).toFixed(2) + "K";
  } else {
    return number.toString();
  }
}



 export const formatMonthAndYear=(date: Date): string =>{
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
}


interface UrlQueryParams {
  params:string;
  key:string;
  value:string | null;

}

export const formUrlQuery=({params,key,value}:UrlQueryParams) =>{
  const currentUrl =qs.parse(params);
  currentUrl[key]=value;

  return qs.stringifyUrl({
    url:window.location.pathname,
    query:currentUrl,
  },{skipNull:true})
}


interface RemoveUrlQueryParams {
  params:string;
  keysRemove:string[];
 

}
export const removeKeysFromQuery=({params,keysRemove}:RemoveUrlQueryParams) =>{
  const currentUrl =qs.parse(params);

  keysRemove.forEach((key)=>{
    delete currentUrl[key]
  })

  return qs.stringifyUrl({
    url:window.location.pathname,
    query:currentUrl,
  },{skipNull:true})
}


