const { Octokit } = require("octokit");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

class GitHubStorageService {
  constructor() {
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.branch = process.env.GITHUB_BRANCH || "main";
    this.baseUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}`;
  }

  /**
   * Upload a file to GitHub repository
   * @param {Buffer} fileBuffer - File content as Buffer
   * @param {string} fileName - Original file name
   * @param {string} folder - Folder path in repo (e.g., 'profiles', 'materials')
   * @returns {Object} - { success, url, path, sha }
   */
  async uploadFile(fileBuffer, fileName, folder = "uploads") {
    try {
      const ext = path.extname(fileName);
      const uniqueName = `${uuidv4()}${ext}`;
      const filePath = `${folder}/${uniqueName}`;

      // Convert buffer to base64
      const content = fileBuffer.toString("base64");

      // Create or update file
      const response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `Upload: ${fileName}`,
        content,
        branch: this.branch,
      });

      const fileUrl = `${this.baseUrl}/${filePath}`;

      logger.info(`File uploaded to GitHub: ${filePath}`);

      return {
        success: true,
        url: fileUrl,
        path: filePath,
        sha: response.data.content.sha,
        fileName: uniqueName,
        originalName: fileName,
      };
    } catch (error) {
      logger.error("GitHub upload error:", error.message);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete a file from GitHub repository
   * @param {string} filePath - File path in repo
   * @param {string} sha - File SHA (optional, will fetch if not provided)
   * @returns {Object} - { success, message }
   */
  async deleteFile(filePath, sha = null) {
    try {
      // Get SHA if not provided
      if (!sha) {
        const fileInfo = await this.getFile(filePath);
        if (!fileInfo.success) {
          return { success: false, message: "File not found" };
        }
        sha = fileInfo.sha;
      }

      await this.octokit.rest.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `Delete: ${filePath}`,
        sha,
        branch: this.branch,
      });

      logger.info(`File deleted from GitHub: ${filePath}`);

      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      logger.error("GitHub delete error:", error.message);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file information from GitHub
   * @param {string} filePath - File path in repo
   * @returns {Object} - { success, content, sha, url }
   */
  async getFile(filePath) {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        ref: this.branch,
      });

      return {
        success: true,
        content: Buffer.from(response.data.content, "base64"),
        sha: response.data.sha,
        url: response.data.download_url,
        size: response.data.size,
      };
    } catch (error) {
      if (error.status === 404) {
        return { success: false, message: "File not found" };
      }
      logger.error("GitHub get file error:", error.message);
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   * @param {string} folderPath - Folder path in repo
   * @returns {Array} - List of files
   */
  async listFiles(folderPath) {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: folderPath,
        ref: this.branch,
      });

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((item) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        url: item.download_url,
        type: item.type,
      }));
    } catch (error) {
      if (error.status === 404) {
        return [];
      }
      logger.error("GitHub list files error:", error.message);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Initialize repository with required folders
   */
  async initializeRepo() {
    const folders = ["profiles", "materials", "assignments", "notices", "timetables", "documents"];

    for (const folder of folders) {
      try {
        // Create a .gitkeep file to initialize folder
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: `${folder}/.gitkeep`,
          message: `Initialize ${folder} folder`,
          content: Buffer.from("").toString("base64"),
          branch: this.branch,
        });
        logger.info(`Initialized folder: ${folder}`);
      } catch (error) {
        if (error.status !== 422) {
          // Ignore "file already exists" error
          logger.error(`Failed to initialize folder ${folder}:`, error.message);
        }
      }
    }
  }

  /**
   * Get file URL from path
   */
  getFileUrl(filePath) {
    return `${this.baseUrl}/${filePath}`;
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of { buffer, name, folder }
   * @returns {Array} - Array of upload results
   */
  async uploadMultiple(files) {
    const results = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file.buffer, file.name, file.folder);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          fileName: file.name,
          error: error.message,
        });
      }
    }

    return results;
  }
}

// Singleton instance
const githubStorage = new GitHubStorageService();

module.exports = githubStorage;
