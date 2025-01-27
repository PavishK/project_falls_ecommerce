import otpGenerator from 'otp-generator';

export const OTP=()=>{
    const otp=otpGenerator.generate(6,{upperCaseAlphabets:true,lowerCaseAlphabets:false,specialChars:false});
    const expires=Date.now()+5*60*1000;


    return {otp:otp,expires:expires};
};