export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/delivery_manager(.*)":["delivery_manager"],
  "/teacher(.*)": ["teacher"],
  "/list/teachers": ["admin", "delivery_manager", "teacher"],
  "/list/students": ["admin", "delivery_manager", "teacher"],
  "/list/subjects": ["admin","delivery_manager"],
  "/list/classes": ["admin", "teacher", "delivery_manager"],
  "/list/events": ["admin", "teacher", "student", "parent", "delivery_manager"],
  "/list/announcements": ["admin", "teacher", "student", "parent", "delivery_manager"],
  "/list/dm" : ["admin","delivery_manager"]
};

