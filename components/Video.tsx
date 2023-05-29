import {useState, useEffect} from "react";


export function Video({videoUrl}) {
    const [url, setUrl] = useState(videoUrl);
    useEffect(() => {
        setUrl(videoUrl);
    }, [videoUrl]);
    if (videoUrl.length === 0) {
        return <></>;
    }
    return (
        <video
            className={`${videoUrl.length === 0 ? "hidden" : "block m-4"}`}
            autoPlay
            controls
            muted
            src={videoUrl}
        />
    );
}
