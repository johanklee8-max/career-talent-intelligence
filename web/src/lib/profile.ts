export interface Education {institution:string;degree:string;field?:string;startDate?:string;endDate?:string}
export interface Experience {company:string;title:string;description:string;startDate?:string;endDate?:string}
export interface CareerProfile {id:string;userId:string;headline:string;summary:string;skills:string[];languages:string[];education:Education[];experience:Experience[];interests:string[];ambitions:string;preferredLocations:string[];preferredIndustries:string[];workPreferences:string[];createdAt:string;updatedAt:string}
