"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import useSWR from "swr"
import axios from "axios"
import { useTranslation } from "react-i18next"
import { Search, Users, UserRound, X, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ⚠️ WARNING: EDUCATIONAL PURPOSE ONLY ⚠️
// This code is intentionally vulnerable to XSS attacks for educational purposes.
// NEVER use this approach in production applications!

// Add Axios interceptors for logging
axios.interceptors.request.use(
  (request) => {
    console.log("Starting Request", request)
    return request
  },
  (error) => {
    console.error("Request Error", error)
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => {
    console.log("Response:", response)
    return response
  },
  (error) => {
    console.error("Response Error", error)
    return Promise.reject(error)
  },
)

const fetcher = (url) =>
  axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
      },
    })
    .then((res) => res.data)

// Get initials from name
const getInitials = (name) => {
  if (!name) return "VL"
  // ⚠️ XSS VULNERABILITY: Directly using regex without proper sanitization
  const cleanName = name.replace(/<\/?[^>]+(>|$)/g, "")
  return cleanName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Generate a consistent color based on string
const stringToColor = (str) => {
  if (!str) return "hsl(215, 20%, 65%)"
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = hash % 360
  return `hsl(${h}, 70%, 60%)`
}

// Generate a consistent pastel color for event badges
const eventToColor = (event) => {
  if (!event) return "bg-gray-100 text-gray-800"

  const eventColors = {
    "Cikalang River Cleanup Action": "bg-blue-100 text-blue-800 border-blue-200",
    "Beach Cleanup": "bg-teal-100 text-teal-800 border-teal-200",
    "Tree Planting": "bg-green-100 text-green-800 border-green-200",
    "Food Drive": "bg-amber-100 text-amber-800 border-amber-200",
    "Community Workshop": "bg-purple-100 text-purple-800 border-purple-200",
  }

  return eventColors[event] || "bg-gray-100 text-gray-800 border-gray-200"
}

// ⚠️ XSS VULNERABILITY: This function directly renders HTML without sanitization
// Example attack: <img src="x" onerror="alert('XSS Attack!')" />
const createMarkup = (html) => {
  return { __html: html || "" }
}

const VolunteerList = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEvent, setSelectedEvent] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [uniqueEvents, setUniqueEvents] = useState([])

  // Refs for direct DOM manipulation to ensure XSS execution
  const nameRefs = useRef({})
  const bioRefs = useRef({})
  const addressRefs = useRef({})

  // ⚠️ XSS VULNERABILITY: Directly executing JavaScript from URL parameters
  // Example attack: ?xss=document.cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const xssParam = params.get("xss")
    if (xssParam) {
      try {
        // ⚠️ EXTREMELY DANGEROUS: Never do this in real applications!
        // eslint-disable-next-line no-eval
        eval(xssParam)
      } catch (e) {
        console.error("Error executing parameter:", e)
      }
    }
  }, [])

  const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/volunteers`, fetcher)

  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  // Extract unique events from data
  useEffect(() => {
    if (data?.data) {
      const events = [...new Set(data.data.map((volunteer) => volunteer.event).filter(Boolean))]
      setUniqueEvents(events)
    }
  }, [data])

  // Filter volunteers based on search term and selected event
  const filteredVolunteers = data?.data?.filter((volunteer) => {
    const name = volunteer.fullName || volunteer.groupName || ""
    // ⚠️ XSS VULNERABILITY: Simple regex is not sufficient for HTML sanitization
    const cleanName = name.replace(/<\/?[^>]+(>|$)/g, "")
    const nameMatch = cleanName.toLowerCase().includes(searchTerm.toLowerCase())
    const eventMatch = !selectedEvent || volunteer.event === selectedEvent
    return nameMatch && eventMatch
  })

  // ⚠️ XSS VULNERABILITY: Direct DOM manipulation to ensure XSS execution
  // This bypasses React's sanitization and directly sets innerHTML
  useEffect(() => {
    if (data?.data) {
      // Small delay to ensure refs are available
      setTimeout(() => {
        data.data.forEach((volunteer) => {
          const id = volunteer.id

          // Set name HTML directly
          if (nameRefs.current[id]) {
            const name = volunteer.fullName || volunteer.groupName || ""
            nameRefs.current[id].innerHTML = name
          }

          // Set bio HTML directly
          if (bioRefs.current[id]) {
            const bio = volunteer.motivation || ""
            bioRefs.current[id].innerHTML = bio
          }

          // Set address HTML directly
          if (addressRefs.current[id] && volunteer.address) {
            addressRefs.current[id].innerHTML = volunteer.address
          }
        })
      }, 100)
    }
  }, [data, viewMode, filteredVolunteers])

  // Group volunteers by event
  const volunteersByEvent = {}
  if (filteredVolunteers) {
    filteredVolunteers.forEach((volunteer) => {
      const event = volunteer.event || t("no_event")
      if (!volunteersByEvent[event]) {
        volunteersByEvent[event] = []
      }
      volunteersByEvent[event].push(volunteer)
    })
  }

  // Card animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedEvent("")
  }

  // ⚠️ XSS VULNERABILITY: Directly rendering user input in the DOM
  // This allows attackers to inject scripts via the search field
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // ⚠️ EXTREMELY DANGEROUS: Never do this in real applications!
    // This creates a DOM-based XSS vulnerability
    document.getElementById("search-term-display").innerHTML = `Searching for: ${value}`
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">{t("error_loading_data")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section ref={ref} className="py-16 px-4 md:px-8 bg-background">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Users className="h-3.5 w-3.5 mr-1" />
            {t("our_team")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("volunteer_list")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              "volunteer_description",
              "Meet our amazing volunteers who dedicate their time and skills to make a difference in our community.",
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-background/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={t("search_volunteers", "Search volunteers...")}
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  {/* ⚠️ XSS VULNERABILITY: This element will be populated with unsanitized user input */}
                  <div id="search-term-display" className="text-xs text-muted-foreground mt-1"></div>
                </div>

                <div className="flex-1">
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("filter_by_event", "Filter by event")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("all_events", "All events")}</SelectItem>
                      {uniqueEvents.map((event) => (
                        <SelectItem key={event} value={event}>
                          {event}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Tabs defaultValue="grid" value={viewMode} onValueChange={setViewMode} className="h-10">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="grid">
                        <div className="grid grid-cols-2 gap-0.5 h-4 w-4 mr-2">
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                        </div>
                        Grid
                      </TabsTrigger>
                      <TabsTrigger value="group">
                        <Calendar className="h-4 w-4 mr-2" />
                        By Event
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {(searchTerm || selectedEvent) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={clearFilters}
                      title={t("clear_filters", "Clear filters")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {(searchTerm || selectedEvent) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      {/* ⚠️ XSS VULNERABILITY: Directly rendering user input */}
                      <span dangerouslySetInnerHTML={createMarkup(searchTerm)}></span>
                      <button
                        className="ml-1 rounded-full hover:bg-secondary-foreground/10"
                        onClick={() => setSearchTerm("")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedEvent && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedEvent}
                      <button
                        className="ml-1 rounded-full hover:bg-secondary-foreground/10"
                        onClick={() => setSelectedEvent("")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {isLoading || !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mt-4" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid-view"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredVolunteers?.length > 0 ? (
                  filteredVolunteers.map((volunteer) => {
                    const name = volunteer.fullName || volunteer.groupName || t("anonymous")
                    const role = volunteer.registrationType || t("volunteer")
                    const bio = volunteer.motivation || t("no_bio")
                    const avatarColor = stringToColor(name)

                    // ⚠️ XSS VULNERABILITY: Directly using innerHTML to set content
                    // This allows any script in the data to execute
                    return (
                      <motion.div key={volunteer.id} variants={cardVariants} whileHover="hover" layout>
                        <Card className="h-full overflow-hidden border border-border/50 transition-all duration-300">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 border-2" style={{ borderColor: avatarColor }}>
                                <AvatarImage src={volunteer.avatarUrl} alt={name} />
                                <AvatarFallback style={{ backgroundColor: avatarColor, color: "white" }}>
                                  {getInitials(name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                {/* ⚠️ XSS VULNERABILITY: Using direct DOM manipulation for name */}
                                <CardTitle
                                  className="text-lg"
                                  ref={(el) => (nameRefs.current[volunteer.id] = el)}
                                ></CardTitle>
                                <CardDescription className="capitalize">{role}</CardDescription>
                              </div>
                            </div>
                            {volunteer.event && (
                              <Badge variant="outline" className={`mt-2 ${eventToColor(volunteer.event)}`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                {volunteer.event}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent>
                            {/* ⚠️ XSS VULNERABILITY: Using direct DOM manipulation for bio */}
                            <div
                              className="text-muted-foreground text-sm line-clamp-3 overflow-hidden"
                              ref={(el) => (bioRefs.current[volunteer.id] = el)}
                            ></div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {volunteer.phoneNumber && (
                                <Badge variant="secondary" className="text-xs">
                                  {volunteer.phoneNumber}
                                </Badge>
                              )}
                              {volunteer.email && (
                                <Badge variant="secondary" className="text-xs">
                                  {/* ⚠️ XSS VULNERABILITY: Email could contain malicious HTML */}
                                  <span dangerouslySetInnerHTML={createMarkup(volunteer.email)}></span>
                                </Badge>
                              )}
                              {volunteer.address && (
                                <Badge variant="secondary" className="text-xs">
                                  {/* ⚠️ XSS VULNERABILITY: Using direct DOM manipulation for address */}
                                  <span ref={(el) => (addressRefs.current[volunteer.id] = el)}></span>
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="text-xs text-muted-foreground">
                              {new Date(volunteer.createdAt).toLocaleDateString()}
                            </div>
                            {volunteer.documentId && (
                              <Badge variant="outline" size="sm">
                                ID: {volunteer.documentId.substring(0, 8)}
                              </Badge>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    )
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-12"
                  >
                    <UserRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">{t("no_volunteers_found")}</h3>
                    <p className="text-muted-foreground">{t("try_different_search")}</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      {t("clear_filters", "Clear filters")}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="group-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                {Object.keys(volunteersByEvent).length > 0 ? (
                  Object.entries(volunteersByEvent).map(([event, volunteers]) => (
                    <motion.div
                      key={event}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mb-8"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={`${eventToColor(event)} text-sm py-1 px-3`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          {event}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {volunteers.length} {volunteers.length === 1 ? t("volunteer") : t("volunteers")}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {volunteers.map((volunteer) => {
                          const name = volunteer.fullName || volunteer.groupName || t("anonymous")
                          const role = volunteer.registrationType || t("volunteer")
                          const avatarColor = stringToColor(name)

                          return (
                            <motion.div
                              key={volunteer.id}
                              variants={cardVariants}
                              initial="hidden"
                              animate="show"
                              whileHover="hover"
                            >
                              <Card className="border border-border/50 transition-all duration-300">
                                <CardHeader className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2" style={{ borderColor: avatarColor }}>
                                      <AvatarFallback style={{ backgroundColor: avatarColor, color: "white" }}>
                                        {getInitials(name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      {/* ⚠️ XSS VULNERABILITY: Using direct DOM manipulation for name */}
                                      <CardTitle
                                        className="text-base"
                                        ref={(el) => (nameRefs.current[volunteer.id] = el)}
                                      ></CardTitle>
                                      <CardDescription className="text-xs capitalize">{role}</CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <UserRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">{t("no_volunteers_found")}</h3>
                    <p className="text-muted-foreground">{t("try_different_search")}</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      {t("clear_filters", "Clear filters")}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Stats section */}
        {data?.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{data.data.length}</div>
                  <p className="text-sm text-muted-foreground">{t("total_volunteers")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{uniqueEvents.length}</div>
                  <p className="text-sm text-muted-foreground">{t("total_events")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {data.data.filter((v) => v.registrationType === "individual").length}
                  </div>
                  <p className="text-sm text-muted-foreground">{t("individual_volunteers")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {data.data.filter((v) => v.registrationType === "group").length}
                  </div>
                  <p className="text-sm text-muted-foreground">{t("group_volunteers")}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default VolunteerList

