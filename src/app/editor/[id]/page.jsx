"use client";

import React from "react";
import { Image as IKImage, ImageKitProvider, upload } from "@imagekit/next";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

// ImageKit URL endpoint from environment variable
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/demo";

export default function EditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id || "demo";
  const initialSrc = searchParams?.get?.("src") || "";
  const [baseUrl, setBaseUrl] = React.useState(initialSrc);
  const [transformations, setTransformations] = React.useState([]);
  const [transformationHistory, setTransformationHistory] = React.useState([]); // Stack for undo
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      content:
        "I'm ready. List out your requirements. (e.g., 'Crop to face, remove background, and increase contrast').",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const scrollRef = React.useRef(null);
  const [localPreview, setLocalPreview] = React.useState("");
  const [previewError, setPreviewError] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedImagePath, setUploadedImagePath] = React.useState("");
  const uploadInProgress = React.useRef(false); // Prevent double uploads
  const [historyLoaded, setHistoryLoaded] = React.useState(false);
  const saveTimeoutRef = React.useRef(null); // Debounce saves

  React.useEffect(() => {
    setBaseUrl(initialSrc);
  }, [initialSrc]);

  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Load history on mount
  React.useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/history?sessionId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) {
            setMessages(data.messages);
          }
          if (data.transformations?.length > 0) {
            setTransformations(data.transformations);
          }
          if (data.transformationHistory?.length > 0) {
            setTransformationHistory(data.transformationHistory);
          }
          if (data.imageUrl) {
            setBaseUrl(data.imageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setHistoryLoaded(true);
      }
    }
    loadHistory();
  }, [id]);

  // Save history when messages or transformations change (debounced)
  React.useEffect(() => {
    if (!historyLoaded) return; // Don't save until initial load is complete

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to avoid too many requests
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: id,
            messages,
            transformations,
            transformationHistory,
            imageUrl: baseUrl,
          }),
        });
      } catch (error) {
        console.error("Failed to save history:", error);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id, messages, transformations, transformationHistory, baseUrl, historyLoaded]);

  // Undo last transformation
  const handleUndo = React.useCallback(() => {
    if (transformationHistory.length === 0) return;

    // Pop the last state from history
    const newHistory = [...transformationHistory];
    newHistory.pop();

    // Get the previous transformations (or empty if nothing left)
    const previousTransformations = newHistory.length > 0
      ? newHistory[newHistory.length - 1]
      : [];

    setTransformationHistory(newHistory);
    setTransformations(previousTransformations);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Undid last transformation.",
      },
    ]);
  }, [transformationHistory]);

  // Clear session to upload a new image
  const handleClearSession = React.useCallback(() => {
    setBaseUrl("");
    setLocalPreview("");
    setUploadedImagePath("");
    setTransformations([]);
    setTransformationHistory([]);
    setPreviewError(false);
    uploadInProgress.current = false;
    setMessages([
      {
        role: "assistant",
        content: "Session cleared. Upload a new image to start editing.",
      },
    ]);
  }, []);

  // For ImageKit hosted images, use the path; for local, use data URL
  const isImageKitUrl = baseUrl.includes("ik.imagekit.io");

  // Extract URL endpoint dynamically from the baseUrl
  const urlEndpointMatch = baseUrl.match(/^(https?:\/\/ik\.imagekit\.io\/[^/]+)/);
  const urlEndpoint = urlEndpointMatch ? urlEndpointMatch[1] : IMAGEKIT_URL_ENDPOINT;

  // Extract just the path after the endpoint
  const imagePath = isImageKitUrl
    ? baseUrl.replace(/^https?:\/\/ik\.imagekit\.io\/[^/]+/, "")
    : uploadedImagePath
      ? uploadedImagePath
      : baseUrl;
  const previewSrc = localPreview || baseUrl;

  React.useEffect(() => {
    setPreviewError(false);
  }, [previewSrc]);

  // Upload file to ImageKit - with guard to prevent double calls
  const uploadToImageKit = React.useCallback(async (file) => {
    // Prevent duplicate upload calls
    if (uploadInProgress.current) return;
    uploadInProgress.current = true;
    setIsUploading(true);

    try {
      // Get upload auth params from our API
      const authRes = await fetch("/api/upload-auth");
      if (!authRes.ok) {
        throw new Error("Failed to get upload auth");
      }
      const { token, expire, signature, publicKey } = await authRes.json();

      // Upload to ImageKit
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        token,
        expire,
        signature,
        publicKey,
      });

      console.log("Upload response:", uploadResponse);

      // Set the uploaded image path for live preview
      if (uploadResponse?.filePath) {
        setUploadedImagePath(uploadResponse.filePath);
        // Update baseUrl to the full ImageKit URL for consistent handling
        setBaseUrl(`${IMAGEKIT_URL_ENDPOINT}${uploadResponse.filePath}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Image uploaded successfully! You can now describe the edits you want.",
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Upload failed. The preview shows your local image, but live transformations won't be available.",
        },
      ]);
    } finally {
      setIsUploading(false);
      uploadInProgress.current = false;
    }
  }, []);

  const onDrop = React.useCallback((acceptedFiles) => {
    if (localPreview || isUploading) return; // Prevent re-upload
    const file = acceptedFiles?.[0];
    if (!file) return;

    setPreviewError(false);

    // First show local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLocalPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Then upload to ImageKit in background
    uploadToImageKit(file);
  }, [localPreview, isUploading, uploadToImageKit]);

  // Show preview for either local uploads OR ImageKit URLs from query param
  const hasImage = (localPreview || isImageKitUrl || uploadedImagePath) && !previewError;

  // Disable upload only if user has already uploaded locally OR if using URL param
  const uploadDisabled = localPreview || isImageKitUrl || isUploading;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop,
    disabled: uploadDisabled,
    noClick: uploadDisabled,
    noDrag: uploadDisabled,
  });

  // Single useEffect for preview error reset

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, imageId: id }),
      });

      const data = await res.json();

      // Check for API errors
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error,
          },
        ]);
        return;
      }

      const newTransformations = data?.params || {};

      // Handle both array (chained AI transforms) and object responses
      // Skip empty objects
      if (Object.keys(newTransformations).length > 0 || Array.isArray(newTransformations)) {
        const transformArray = Array.isArray(newTransformations)
          ? newTransformations
          : [newTransformations];

        // Save current state to history before applying new transformations
        setTransformations((prev) => {
          const newTransforms = [...prev, ...transformArray];
          // Also save to history stack for undo
          setTransformationHistory((history) => [...history, newTransforms]);
          return newTransforms;
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Applied: ${JSON.stringify(newTransformations)}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I couldn't understand that request. Try something like 'Remove background' or 'Crop to face'.",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Workspace</p>
              <h1 className="text-3xl font-semibold text-white">AI Image Editor</h1>
            </div>
            {hasImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSession}
                className="text-xs border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                + New Image
              </Button>
            )}
          </div>
          <p className="text-sm text-neutral-400">
            Session: {id} • Describe edits and the agent will generate ImageKit parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="h-full border-0 bg-black">
            <CardContent className="p-0">
              <div className="flex flex-col gap-6">
                {/* Preview Section - only visible after upload */}
                {hasImage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        {isImageKitUrl ? "Live Preview" : isUploading ? "Uploading..." : "Preview"}
                      </p>
                      <div className="flex items-center gap-2">
                        {isUploading && (
                          <span className="text-xs text-blue-400 animate-pulse">
                            Uploading to ImageKit...
                          </span>
                        )}
                        {transformations.length > 0 && (
                          <span className="text-xs text-neutral-500">
                            {transformations.length} transformation{transformations.length > 1 ? 's' : ''} applied
                          </span>
                        )}
                        {transformationHistory.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleUndo}
                            className="h-6 px-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
                          >
                            ↩ Undo
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="relative flex min-h-[400px] items-center justify-center rounded-2xl bg-neutral-950 border border-neutral-800">
                      {isImageKitUrl ? (
                        <ImageKitProvider urlEndpoint={urlEndpoint}>
                          <IKImage
                            src={imagePath}
                            alt="Edited preview"
                            width={720}
                            height={400}
                            transformation={transformations}
                            className="max-h-[400px] w-full object-contain"
                            onError={() => setPreviewError(true)}
                          />
                        </ImageKitProvider>
                      ) : (
                        <Image
                          src={previewSrc}
                          alt="Uploaded preview"
                          width={720}
                          height={400}
                          className="max-h-[400px] w-full object-contain"
                          onError={() => setPreviewError(true)}
                        />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-white">Uploading to ImageKit...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Info shown only during upload */}
                    {isUploading && (
                      <div className="rounded-lg bg-blue-900/20 border border-blue-800/50 p-3">
                        <p className="text-xs text-blue-300">
                          Your image is being uploaded to ImageKit. Once complete, you'll get live transformations!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Section - only visible before upload */}
                {!hasImage && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Upload
                    </p>
                    <div
                      {...getRootProps()}
                      className={`relative flex min-h-[300px] cursor-pointer items-center justify-center rounded-2xl bg-black px-8 text-center transition-all ${isDragActive ? "ring-2 ring-white" : ""
                        }`}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-3">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black border border-neutral-800 text-neutral-100">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="h-8 w-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 0 3 3m-3-3-3 3M4 16a4 4 0 0 1 4-4h1m6 0h1a4 4 0 0 1 4 4"
                            />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-semibold text-white">
                            Drag & drop your image here
                          </p>
                          <p className="text-sm text-neutral-400">or click to browse</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG, WEBP • Max 25MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full border-0 bg-black">
            <CardHeader className="px-0">
              <CardTitle className="text-white">Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex h-full flex-col gap-4 px-0">
              <ScrollArea className="h-[420px] rounded-lg bg-black border border-neutral-800">
                <div ref={scrollRef} className="space-y-3 p-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-lg px-3 py-2 text-sm ${message.role === "user"
                        ? "ml-auto max-w-[80%] bg-black text-white border border-neutral-800"
                        : "mr-auto max-w-[80%] bg-black text-neutral-100"
                        }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Describe the edits you want..."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSend();
                    }
                  }}
                  className="bg-black border border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                />
                <Button
                  onClick={handleSend}
                  disabled={isSending}
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  {isSending ? "Planning..." : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
}
