(ns crawler.core
  (:require [clojure.string :as string :refer [join]]
            [clj-http.client :as http]
            [cheshire.core :as json]
            [hiccup.core :refer [html]]))

(defn crawl [path]
  (let [res (http/get (str "https://api.ldjam.com/vx" path))]
    ; TODO handle errors
    (json/parse-string (:body res) true)))

(defn nodes [path]
  (let [ns (join "+" (map #(str (:id %)) (:feed (crawl path))))]
    (:node (crawl (str "/node2/get/" ns)))))

(defn crawl-events []
  (into (sorted-map-by >) (map #(vector (:id %) (:name %))
                               (nodes "/node/feed/9/parent/group+event?limit=200"))))

(defn crawl-games [author]
  (let [id (:node_id (crawl (str "/node2/walk/1/users/" author)))]
    (nodes (str "/node/feed/" id "/authors/item/game?limit=250"))))

(defn games-map [author]
  (let [games (crawl-games author)]
    (into {} (map #(vector (:parent %) %) games))))

(defn render-head [events]
  (vec (conj (->> (vals events)
                  (map #(string/replace % #"[^0-9]" ""))
                  (filter not-empty)
                  (map (fn [n] (vector :li [:a {:href (str n ".html")} n]))))
             :ui#events)))

(comment
  (filter not-empty ["one" "" "two" "three"])
  (def res (http/get "https://api.ldjam.com/vx/node2/walk/1/users/yngvarr"))
  (json/parse-string (:body res) true)
  (crawl "/node2/walk/1/users/yngvarr")
  (prn (nodes "/node/feed/9/parent/group+event?limit=200"))
  (prn (crawl-events))
  (prn (html (render-head (crawl-events))))
  (prn (map :parent (crawl-games "yngvarr")))
  (prn (games-map "yngvarr"))
  (html [:span.foo "bar"])
  )
