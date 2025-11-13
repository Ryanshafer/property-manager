import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { AdminAction, AdminState, ContactChannel, Property, SessionUser, User } from "@/features/admin/types";
import {
  cloneProperty,
  createEmptyProperty,
  deriveAccessLevel,
  initialProperties,
  initialUsers,
  isPropertyManagerRole,
  normalizeAvailability,
} from "@/features/admin/utils";

const normalizeChannels = (channels: ContactChannel[] = []): ContactChannel[] => {
  if (channels.length === 0) return [];
  const hasPrimary = channels.some((channel) => channel.primary);
  return channels.map((channel, index) => ({
    ...channel,
    primary: hasPrimary ? Boolean(channel.primary) : index === 0,
  }));
};

const ensureManagerAssignments = (users: User[], properties: Property[]): User[] => {
  const managerCandidates = users.filter((user) => isPropertyManagerRole(user.role));
  if (managerCandidates.length !== 1) {
    return users;
  }
  const propertyIds = properties.map((property) => property.id);
  return users.map((user) => {
    if (user.id !== managerCandidates[0].id) return user;
    const currentIds = user.managedPropertyIds || [];
    const alreadyHasAll =
      currentIds.length === propertyIds.length && propertyIds.every((id) => currentIds.includes(id));
    if (alreadyHasAll) return user;
    return {
      ...user,
      managedPropertyIds: propertyIds,
    };
  });
};

const INITIAL_STATE: AdminState = {
  authed: false,
  user: null,
  properties: initialProperties,
  selectedPropertyId: initialProperties[0]?.id,
  users: ensureManagerAssignments(initialUsers, initialProperties),
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        authed: true,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...INITIAL_STATE,
        properties: state.properties,
        selectedPropertyId: state.properties[0]?.id,
        users: state.users,
      };
    case "ADD_PROPERTY": {
      const properties = [...state.properties, action.payload];
      return {
        ...state,
        properties,
        selectedPropertyId: action.payload.id,
        users: ensureManagerAssignments(state.users, properties),
      };
    }
    case "CLONE_PROPERTY": {
      const properties = [...state.properties, action.payload.cloned];
      return {
        ...state,
        properties,
        selectedPropertyId: action.payload.cloned.id,
        users: ensureManagerAssignments(state.users, properties),
      };
    }
    case "DELETE_PROPERTY": {
      const properties = state.properties.filter((property) => property.id !== action.payload.id);
      const selectedPropertyId = state.selectedPropertyId === action.payload.id ? properties[0]?.id : state.selectedPropertyId;
      return {
        ...state,
        properties,
        selectedPropertyId,
        users: ensureManagerAssignments(state.users, properties),
      };
    }
    case "SELECT_PROPERTY":
      return {
        ...state,
        selectedPropertyId: action.payload.id ?? state.selectedPropertyId ?? state.properties[0]?.id,
      };
    case "UPDATE_PROPERTY": {
      const properties = state.properties.map((property) =>
        property.id === action.payload.id ? { ...action.payload.property, updatedAt: new Date().toISOString() } : property,
      );
      return {
        ...state,
        properties,
      };
    }
    case "UPDATE_PROPERTY_NODE": {
      const properties = state.properties.map((property) => {
        if (property.id !== action.payload.id) return property;
        return {
          ...property,
          [action.payload.node]: action.payload.value,
          updatedAt: new Date().toISOString(),
        } as Property;
      });
      return {
        ...state,
        properties,
      };
    }
    case "IMPORT_PROPERTY_JSON": {
      const exists = state.properties.some((property) => property.id === action.payload.id);
      const properties = exists
        ? state.properties.map((property) => (property.id === action.payload.id ? action.payload : property))
        : [...state.properties, action.payload];
      return {
        ...state,
        properties,
        selectedPropertyId: action.payload.id,
        users: ensureManagerAssignments(state.users, properties),
      };
    }
    case "ADD_USER": {
      const users = ensureManagerAssignments([...state.users, action.payload.user], state.properties);
      return {
        ...state,
        users,
      };
    }
    case "UPDATE_USER": {
      const users = ensureManagerAssignments(
        state.users.map((user) => (user.id === action.payload.user.id ? action.payload.user : user)),
        state.properties,
      );
      return {
        ...state,
        users,
      };
    }
    case "DELETE_USER": {
      const users = ensureManagerAssignments(
        state.users.filter((user) => user.id !== action.payload.id),
        state.properties,
      );
      return {
        ...state,
        users,
      };
    }
    case "EXPORT_PROPERTY_JSON":
    default:
      return state;
  }
}

type SaveUserInput = Omit<User, "id"> & { id?: string };

type AdminContextValue = AdminState & {
  login: (user: SessionUser) => void;
  logout: () => void;
  addProperty: (input: { name: string; location?: string }) => Property;
  cloneProperty: (input: { sourceId: string; name?: string; location?: string }) => Property | undefined;
  deleteProperty: (id: string) => void;
  selectProperty: (id?: string) => void;
  updateProperty: (property: Property) => void;
  updatePropertyNode: <K extends keyof Property>(id: string, node: K, value: Property[K]) => void;
  importProperty: (property: Property) => void;
  exportProperty: (id: string) => Property | undefined;
  getSelectedProperty: () => Property | undefined;
  addUser: (input: SaveUserInput) => User;
  updateUser: (user: User) => void;
  deleteUserAccount: (id: string) => void;
  permissions: {
    isAdmin: boolean;
    isEditor: boolean;
    isViewer: boolean;
    canEditContent: boolean;
    canAddEntities: boolean;
    canManageUsers: boolean;
    canDeleteEntities: boolean;
  };
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(adminReducer, INITIAL_STATE);

  const selectProperty = useCallback((id?: string) => {
    dispatch({ type: "SELECT_PROPERTY", payload: { id } });
  }, []);

  const value = useMemo<AdminContextValue>(() => {
    const addProperty = (input: { name: string; location?: string }) => {
      const property = createEmptyProperty(input);
      dispatch({ type: "ADD_PROPERTY", payload: property });
      return property;
    };

    const updateProperty = (property: Property) => {
      // TODO(api): Add real endpoints
      dispatch({ type: "UPDATE_PROPERTY", payload: { id: property.id, property } });
    };

    const updatePropertyNode = <K extends keyof Property>(id: string, node: K, value: Property[K]) => {
      dispatch({ type: "UPDATE_PROPERTY_NODE", payload: { id, node, value } });
    };

    const clone = (input: { sourceId: string; name?: string; location?: string }) => {
      const source = state.properties.find((property) => property.id === input.sourceId);
      if (!source) return undefined;
      const cloned = cloneProperty(source, { name: input.name, location: input.location });
      dispatch({ type: "CLONE_PROPERTY", payload: { sourceId: input.sourceId, cloned } });
      return cloned;
    };

    const exportProperty = (id: string) => state.properties.find((property) => property.id === id);

    const getSelectedProperty = () => state.properties.find((property) => property.id === state.selectedPropertyId);

const buildUser = (input: SaveUserInput): User => ({
  id: input.id ?? `user-${Date.now().toString(36)}`,
  name: input.name?.trim() || "New teammate",
  role: input.role?.trim() || "Team member",
  availability: normalizeAvailability(input.availability),
  photo: input.photo?.trim(),
  channels: normalizeChannels(input.channels ?? []),
  accessLevel: input.accessLevel ?? deriveAccessLevel(input.role),
  managedPropertyIds: input.managedPropertyIds ?? [],
});

    const addUserAccount = (input: SaveUserInput) => {
      const user = buildUser(input);
      dispatch({ type: "ADD_USER", payload: { user } });
      return user;
    };

    const updateUserAccount = (input: User) => {
      const user = buildUser(input);
      dispatch({ type: "UPDATE_USER", payload: { user } });
    };

    const accessLevel = state.user?.accessLevel ?? "viewer";
    const permissions = {
      isAdmin: accessLevel === "admin",
      isEditor: accessLevel === "editor",
      isViewer: accessLevel === "viewer",
      canEditContent: accessLevel !== "viewer",
      canAddEntities: accessLevel === "admin",
      canManageUsers: accessLevel === "admin",
      canDeleteEntities: accessLevel === "admin",
    } as const;

    return {
      ...state,
      login: (user) => dispatch({ type: "LOGIN", payload: user }),
      logout: () => dispatch({ type: "LOGOUT" }),
      addProperty,
      cloneProperty: clone,
      deleteProperty: (id: string) => dispatch({ type: "DELETE_PROPERTY", payload: { id } }),
      selectProperty,
      updateProperty,
      updatePropertyNode,
      importProperty: (property: Property) =>
        dispatch({
          type: "IMPORT_PROPERTY_JSON",
          payload: { ...property, updatedAt: property.updatedAt || new Date().toISOString() },
        }),
      exportProperty,
      getSelectedProperty,
      addUser: addUserAccount,
      updateUser: updateUserAccount,
      deleteUserAccount: (id: string) => dispatch({ type: "DELETE_USER", payload: { id } }),
      permissions,
    };
  }, [state, selectProperty]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }
  return context;
};
