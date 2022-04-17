'use strict';

import Axios from 'axios';
import { sign,StringObject } from './utils/encryption';
import formDataHandle from './utils/form_data_handle';

class uniCloudStorage{

    spaceId:string
    clientSecret:string

    constructor( spaceId:string, clientSecret:string){
        this.spaceId = spaceId;
        this.clientSecret = clientSecret;
    }
    async upload(file:File,fileName = ''):
        Promise<{ 
            success: boolean; 
            status?: number | undefined; 
            error?: { code: string; message: string; } | undefined; 
            data?: {
                accessKeyId: string
                cdnDomain: string
                host: string
                id: string
                ossPath: string
                policy: string
                signature: string
                target: string
            } | undefined; 
        }
        >{
        if(!file.name && !fileName){
            return {
                success:false,
                error:{
                    code:'fileNameError',
                    message:'文件名不能为空'
                },
            }
        }
        const tokenData = await this.#getAccessToken()
        if(!tokenData.success){
            return tokenData
        }
        const { accessToken } = tokenData.data
        const fileInfo = await this.#creatFileName(file.name || fileName,accessToken)
        if(!fileInfo.success){
            return fileInfo
        }
        const fileInfoData = fileInfo.data
        const uploadFileResult = await this.#uploadFile(file,fileInfoData)
        if(uploadFileResult.status !== 200){
            return {
                success:false,
                error:{
                    code:'uploadFileError',
                    message:'上传文件失败'
                }
            }
        }
       const checkFileResult = await this.#checkFile(accessToken,fileInfoData.id);
       if(!checkFileResult.success){
            return checkFileResult
       }
       const target = `https://${fileInfoData.cdnDomain}/${fileInfoData.ossPath}`;
       return {
              success:true,
              data:{
                  ...fileInfoData,
                  target,
              }
       }
    }

    // 创建token
    async #getAccessToken(){
        const data:StringObject = {
            method: 'serverless.auth.user.anonymousAuthorize',
            params: '{}',
            spaceId: this.spaceId,
            timestamp: Date.now(),
        };
        const result = await Axios.post('https://api.bspapp.com/client',
        `{\"method\":\"serverless.auth.user.anonymousAuthorize\",\"params\":\"{}\",\"spaceId\":\"${this.spaceId}\",\"timestamp\":${data.timestamp}}`   
        ,{
            headers: {
                'Content-Type': 'application/json',
                'x-serverless-sign': sign(data, this.clientSecret),
            }
        }).then((res)=>{
            return res.data
        })
        return result
    }
    
    // 创建文件信息
        async #creatFileName(filename:string,accessToken:string){
        // 配置吧
        const options = {
            method: 'serverless.file.resource.generateProximalSign',
            params: `{\"env\":\"public\",\"filename\":\"${filename}\"}`,
            spaceId: this.spaceId,
            timestamp: Date.now(),
            token: accessToken,
        };
        const result = await Axios.post(
            'https://api.bspapp.com/client',
            JSON.stringify(options),
            {
                headers: {
                    'x-basement-token': options.token,
                    'x-serverless-sign': sign(options, this.clientSecret),
                    'Content-Type': 'application/json',
                },
            }
        ).then((res)=>{
            return res.data
        })
        return result
    }

    // 上传文件
    async #uploadFile(file:File,predata:{[key:string]:string}){
        const url = 'https://' + predata.host + '/';
        const options = {
            "Cache-Control":"max-age=2592000",
            "Content-Disposition":"attachment",
            "OSSAccessKeyId":predata.accessKeyId,
            "Signature":predata.signature,
            "host":predata.host,
            "id":predata.id,
            "key":predata.ossPath,
            "policy":predata.policy,
            "success_action_status":"200",
        }
        const formDataRes = await formDataHandle(options,file)
        if(!formDataRes.data){
            return {
                status:500,
                success:false,
                error:{
                    code:'file type error',
                    message:'文件类型错误'
                }
            }
        }
        const result = await Axios.post(url,formDataRes.data,{
            headers: {
                ...formDataRes?.headers,
                'X-OSS-server-side-encrpytion': 'AES256',
            },
        })
        return result
    }


    //校验文件
    async #checkFile(accessToken:string,id:string){
        const options = {
            method: 'serverless.file.resource.report',
            params: `{\"id\":\"${id}\"}`,
            spaceId: this.spaceId,
            timestamp: Date.now(),
            token: accessToken,
        };
        const result = await Axios(
        {
            url:'https://api.bspapp.com/client',
            data: options,
            method:'post',
            responseType:'json',
            headers: {
                'content-type': 'application/json',
                'x-basement-token': options.token,
                'x-serverless-sign': sign(options, this.clientSecret),
            },
        }
        ).then((res)=>{
            return res.data
        })
        return result
    }
}

export default uniCloudStorage;