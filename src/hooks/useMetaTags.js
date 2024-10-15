import { useEffect } from "react";

const useMetaTags = ({ title, description }) => {
  useEffect(() => {
    // Set the document title
    document.title = title;

    // Set or update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Clean up if necessary
    return () => {
      if (metaDescription) {
        metaDescription.remove();
      }
    };
  }, [title, description]);
};

export default useMetaTags;
