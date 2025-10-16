from homeassistant import config_entries
from .const import DOMAIN


class DomainConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, dummy):
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        return self.async_create_entry(
            title=DOMAIN,
            data={},
        )