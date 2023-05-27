import { useState, useEffect } from "react";
import axios from "axios";
import { Animate, initTE } from "tw-elements";

initTE({ Animate });
function App() {
  const [photos, setPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [suggestedSearches, setSuggestedSearches] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const flickrApiKey = "ca370d51a054836007519a00ff4ce59e";
  const flickrApiUrl = "https://www.flickr.com/services/rest/";

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    saveSearchTerm();
    fetchPhotos();
  }, [searchTerm]);

  useEffect(() => {
    loadSuggestedSearches();
  }, [suggestedSearches]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.offsetHeight
      ) {
        setIsFetching(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchMorePhotos();
    return () => setIsFetching(false);
  }, [isFetching]);

  const fetchPhotos = async () => {
    setIsLoading(true);

    const params = {
      api_key: flickrApiKey,
      method: "flickr.photos.getRecent",
      format: "json",
      nojsoncallback: 1,
      per_page: 30,
      page: currentPage,
    };

    if (searchTerm) {
      params.method = "flickr.photos.search";
      params.text = searchTerm;
    }

    try {
      const response = await axios.get(flickrApiUrl, { params });
      const photosData = response.data.photos;

      setPhotos((prevPhotos) =>
        searchTerm ? photosData.photo : [...prevPhotos, ...photosData.photo]
      );
      setTotalPages(photosData.pages);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMorePhotos = async () => {
    if (currentPage < totalPages) {
      setIsLoading(true);
      setCurrentPage((prevPage) => prevPage + 1);

      const params = {
        api_key: flickrApiKey,
        method: "flickr.photos.getRecent",
        format: "json",
        nojsoncallback: 1,
        per_page: 30,
        page: currentPage + 1,
      };

      if (searchTerm) {
        params.method = "flickr.photos.search";
        params.text = searchTerm;
      }

      try {
        const response = await axios.get(flickrApiUrl, { params });
        const photosData = response.data.photos;

        setPhotos((prevPhotos) => [...prevPhotos, ...photosData.photo]);
        setTotalPages(photosData.pages);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setPhotos([]);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setIsFetching(true);
    }
  };

  const handleOpenModal = (photo) => {
    setModalPhoto(photo);
  };

  const handleCloseModal = () => {
    setModalPhoto(null);
  };

  const saveSearchTerm = () => {
    if (searchTerm) {
      const storedSearches = JSON.parse(localStorage.getItem("searches")) || [];
      if (!storedSearches.includes(searchTerm)) {
        storedSearches.push(searchTerm);
        localStorage.setItem("searches", JSON.stringify(storedSearches));
      }
    }
  };

  const loadSuggestedSearches = () => {
    const storedSearches = JSON.parse(localStorage.getItem("searches")) || [];
    setSuggestedSearches(storedSearches);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-gray-800 sticky top-0 z-10">
        <nav className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">React Flickr App</h1>
          </div>
          <div className="flex items-center">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch(event.target.search.value);
              }}
              className="mr-4"
            >
              <input
                type="text"
                name="search"
                placeholder="Search for photos..."
                className="px-4 py-2 rounded-lg"
              />
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-blue-500 rounded"
              >
                Search
              </button>
            </form>
            <button
              onClick={() => handleSearch("")}
              className="px-4 py-2 mr-2 font-bold text-white bg-blue-500 rounded"
            >
              Home
            </button>
            <button
              onClick={() => handleSearch("about")}
              className="px-4 py-2 font-bold text-white bg-blue-500 rounded"
            >
              About
            </button>
          </div>
        </nav>
        {suggestedSearches.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold text-white">
              Suggested searches:
            </h2>
            <div className="flex flex-wrap">
              {suggestedSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="px-4 py-2 mr-2 mb-2 text-white bg-gray-700 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
      <main>
        <div className="grid grid-cols-1 gap-8 px-4 py-8 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={index}>
              <img
                src={`https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`}
                alt={photo.title}
                className="w-full cursor-pointer h-80 rounded-2xl hover:scale-110"
                onClick={() => handleOpenModal(photo)}
              />
              <h2 className="my-2 text-lg font-bold">{photo.title}</h2>
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <div class="flex justify-center items-center ">
            <div class="text-gray-500 text-center">
              <h1 class="text-4xl font-bold mb-4">No items found</h1>
              <p class="text-lg">Please try a different search term.</p>
            </div>
          </div>
        )}

        <div id="observer" />
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-b-4 border-gray-800 rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && currentPage < totalPages && (
          <div className="flex justify-center py-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Load More
            </button>
          </div>
        )}
      </main>
      {modalPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseModal}
        >
          <img
            src={`https://live.staticflickr.com/${modalPhoto.server}/${modalPhoto.id}_${modalPhoto.secret}_c.jpg`}
            alt={modalPhoto.title}
            className="max-h-full max-w-full cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default App;
