import axios, { HttpStatusCode, isAxiosError } from "axios";
import BasePostStrategy from "@nodes/post-publishing/strategies/base-post.strategy";

class LinkedInPostStrategy implements BasePostStrategy {
  private readonly _accessToken?: string;
  private readonly _authorId?: string;
  private readonly _postUrl = "https://api.linkedin.com/v2/ugcPosts";
  private readonly _uploadUrl =
    "https://api.linkedin.com/v2/assets?action=registerUpload";

  constructor() {
    this._accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    this._authorId = process.env.LINKEDIN_AUTHOR_ID;
  }

  private validate(): void {
    if (!this._accessToken || !this._authorId) {
      throw new Error(
        "Missing LinkedIn access token or author ID in environment variables.",
      );
    }
  }

  // Download image from the provided URL and return the image data as a buffer
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data, "binary");
  }

  private async uploadImage(imageUrl: string): Promise<string> {
    // Prepare the body for media upload
    const uploadBody = {
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: `urn:li:person:${this._authorId}`,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    };

    // Register the upload to get the upload URL
    const response = await axios.post(this._uploadUrl, uploadBody, {
      headers: {
        Authorization: `Bearer ${this._accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const uploadUrl =
      response.data.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ].uploadUrl;

    // Download the image from the provided URL
    const imageData = await this.downloadImage(imageUrl);

    // Upload the actual image using the obtained upload URL
    await axios.put(uploadUrl, imageData, {
      headers: {
        Authorization: `Bearer ${this._accessToken}`,
        "Content-Type": "image/jpeg", // adjust based on the image type
      },
    });

    return response.data.value.asset; // Return the asset URN for the image
  }

  public async execute(content: string, imageUrl: string): Promise<string> {
    this.validate();

    // Step 1: Upload the image to LinkedIn to get the asset ID
    const assetId = await this.uploadImage(imageUrl);

    // Step 2: Create the post body with the uploaded media asset ID
    const postBody = {
      author: `urn:li:person:${this._authorId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "IMAGE",
          media: [
            {
              status: "READY",
              media: assetId, // Use the asset ID obtained from the upload
              title: { text: "Tech News" },
            },
          ],
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    try {
      // Post the content to LinkedIn
      const response = await axios.post(this._postUrl, postBody, {
        headers: {
          Authorization: `Bearer ${this._accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
      });

      if (response.status === HttpStatusCode.Created) {
        return "LinkedIn post published successfully.";
      } else {
        throw new Error(
          `Status code: ${response.status} - ${response.statusText}. Expected ${HttpStatusCode.Created} code`,
        );
      }
    } catch (error) {
      let message = "";
      if (isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else {
        message = (error as Error).message;
      }
      throw new Error(`Error while publishing LinkedIn post: ${message}`);
    }
  }
}

export default LinkedInPostStrategy;
