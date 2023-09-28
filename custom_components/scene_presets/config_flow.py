from homeassistant import config_entries
from .const import DOMAIN


class DomainConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    CONNECTION_CLASS = config_entries.CONN_CLASS_UNKNOWN
    VERSION = 1

    async def async_step_user(self, dummy):
        return self.async_create_entry(
            title=DOMAIN,
            data={},
        )