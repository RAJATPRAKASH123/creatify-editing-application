'use client'
import React, { useState, ChangeEvent } from "react";
import MyCanvas from "./MyCanvas";

const GetImage: React.FC = () => {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [canvasImage, setCanvasImage] = useState<string | null>(null);

    const onSelectFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            const selectedFilesArray = Array.from(selectedFiles);

            const imagesArray = await Promise.all(selectedFilesArray.map(async (file) => {
                return new Promise<string | null>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            }));

            // Filter out null values before concatenating
            const filteredImagesArray = imagesArray.filter((image) => image !== null) as string[];

            // Now you can concatenate the filtered array
            setSelectedImages((previousImages) => previousImages.concat(filteredImagesArray));


            // FOR BUG IN CHROME
            event.target.value = "";
        }
    };

    function deleteHandler(image: string) {
        setSelectedImages((prevImages) =>
            prevImages.filter((e) => e !== image)
        );
        URL.revokeObjectURL(image);
    }

    const canvasHandler = (image: string) => {
        console.log("haha", image)
        setCanvasImage(image);
    };

    return (

        <section className="py-8">
            {canvasImage ? (
                <MyCanvas
                    imageUrl={canvasImage}
                    onSelect={() => { }}
                    onChange={(newAttrs) => { }}
                />
            ) : (<>
                <label className="flex flex-col justify-center items-center border border-dotted rounded-lg w-40 h-40 cursor-pointer text-lg">
                    + Add Images
                    <br />
                    <span className="text-sm font-light pt-2">up to 10 images</span>
                    <input
                        type="file"
                        name="images"
                        onChange={onSelectFile}
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                </label>
                <br />

                {/* <input type="file" multiple className="hidden" /> */}

                {selectedImages.length > 0 && (
                    selectedImages.length > 10 ? (
                        <p className="error">
                            You can't upload more than 10 images! <br />
                            <span>
                                please delete <b> {selectedImages.length - 10} </b> of them{" "}
                            </span>
                        </p>
                    ) : (
                        <button
                            className="upload-btn block mx-auto border-none rounded-lg w-40 h-12 bg-green-500 text-white"
                            onClick={() => {
                                console.log(selectedImages);
                            }}
                        >
                            UPLOAD {selectedImages.length} IMAGE
                            {selectedImages.length === 1 ? "" : "S"}
                        </button>
                    )
                )}

                <div className="flex flex-row flex-wrap justify-center items-center">
                    {selectedImages &&
                        selectedImages.map((image, index) => (
                            <div key={image} className="image m-4 relative">
                                <img src={image} height="200" alt="upload" />
                                <button
                                    onClick={() => deleteHandler(image)}
                                    className="absolute bottom-0 right-0 cursor-pointer border-none text-white bg-lightcoral"
                                >
                                    delete image
                                </button>
                                <button
                                    onClick={() => canvasHandler(image)}
                                    className="absolute bottom-0 right-0 cursor-pointer border-none text-white bg-lightcoral"
                                >
                                    Let's take this to Canvas!!!
                                </button>
                                <p className="p-2">{index + 1}</p>
                            </div>
                        ))}
                </div>

            </>)}

            {/* Conditionally render MyCanvas component */}

        </section>
    );
};

export default GetImage;
