using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace FileUpload
{
    /// <summary>
    /// Summary description for upload
    /// </summary>
    public class upload : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            
            string fileName = context.Request["file"].ToString();
            string action = context.Request["action"].ToString();
            if (action == "delete") {
                bool d = deleteFile(context.Server.MapPath("~/Files/" + fileName));
            }
            else
            {

                string fileType = context.Request["file_type"].ToString();
                string fileData = context.Request["file_data"].ToString();

                // need to strip the data: junk from the begining of the base64() string
                if (fileData.IndexOf("data:") >= 0)
                {
                    fileData = fileData.Split(',')[1];
                }


                string filePath = context.Server.MapPath("~/Files/" + fileName);
                bool exists = File.Exists(filePath);
                // Delete the file if it already exists and it's a new upload
                if (exists && action == "create")
                    File.Delete(filePath);
                //convert the Base64String to Bytes
                Byte[] incomingBytes = Convert.FromBase64String(fileData);
                // append to the file if it exists
                if (exists)
                {

                    using (FileStream fileStream = new FileStream(context.Server.MapPath("~/Files/" + fileName), FileMode.Append))
                    {
                        for (int i = 0; i < incomingBytes.Length; i++)
                        {
                            fileStream.WriteByte(incomingBytes[i]);
                        }
                        fileStream.Close();
                    }

                }
                else
                {
                    // Create a new file if it doesn't
                    File.WriteAllBytes(filePath, incomingBytes);

                }
            }
             // Send a JSON Response back
            context.Response.ContentType = "text/json";
            context.Response.Write("{\"response\":\"all good\"}");
        }

        public bool deleteFile(string file)
        {
            File.Delete(file);
            return true;
        }

     
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}